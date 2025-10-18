import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';
import type { BackupData } from '../src/types';
import gradient from 'gradient-string';

/**
 * Organized backup database manager
 */
export class BackupDatabase {
    private backupDir: string;
    private metadataFile: string;
    
    constructor(baseDir: string = join(__dirname, '../../cloner')) {
        this.backupDir = baseDir;
        this.metadataFile = join(this.backupDir, 'metadata.json');
        this.initialize();
    }

    /**
     * Initialize the database directory structure
     */
    private initialize(): void {
        // Create main backup directory
        if (!existsSync(this.backupDir)) {
            mkdirSync(this.backupDir, { recursive: true });
            console.log(gradient(['green', 'lime'])(`✅ Created backup directory: ${this.backupDir}`));
        }

        // Create subdirectories for organization
        const subdirs = ['active', 'archive', 'temp'];
        subdirs.forEach(dir => {
            const path = join(this.backupDir, dir);
            if (!existsSync(path)) {
                mkdirSync(path, { recursive: true });
            }
        });

        // Initialize metadata file
        if (!existsSync(this.metadataFile)) {
            this.saveMetadata({
                backups: [],
                lastUpdated: new Date().toISOString()
            });
        }
    }

    /**
     * Save backup metadata
     */
    private saveMetadata(metadata: any): void {
        try {
            writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2), 'utf-8');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(gradient(['red', 'darkred'])(`❌ Failed to save metadata: ${errorMessage}`));
        }
    }

    /**
     * Load backup metadata
     */
    private loadMetadata(): any {
        try {
            if (existsSync(this.metadataFile)) {
                const data = readFileSync(this.metadataFile, 'utf-8');
                return JSON.parse(data);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(gradient(['red', 'darkred'])(`❌ Failed to load metadata: ${errorMessage}`));
        }
        return { backups: [], lastUpdated: new Date().toISOString() };
    }

    /**
     * Save a backup to the database
     */
    public async saveBackup(backupData: BackupData, beautify: boolean = true): Promise<string> {
        try {
            const filename = `${backupData.id}.json`;
            const filepath = join(this.backupDir, 'active', filename);
            
            // Save the backup file
            const content = beautify 
                ? JSON.stringify(backupData, null, 4) 
                : JSON.stringify(backupData);
            
            writeFileSync(filepath, content, 'utf-8');

            // Update metadata
            const metadata = this.loadMetadata();
            metadata.backups.push({
                id: backupData.id,
                guildId: backupData.guildID,
                guildName: backupData.name,
                createdAt: new Date(backupData.createdTimestamp).toISOString(),
                filepath: filepath,
                size: statSync(filepath).size,
                channelCount: backupData.channels.categories.length + backupData.channels.others.length,
                roleCount: backupData.roles.length,
                emojiCount: backupData.emojis.length,
                status: 'active'
            });
            metadata.lastUpdated = new Date().toISOString();
            this.saveMetadata(metadata);

            console.log(gradient(['green', 'lime'])(`✅ Backup saved successfully: ${filename}`));
            return filepath;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(gradient(['red', 'darkred'])(`❌ Failed to save backup: ${errorMessage}`));
            throw error;
        }
    }

    /**
     * Load a backup from the database
     */
    public async loadBackup(backupId: string): Promise<BackupData | null> {
        try {
            const filename = `${backupId}.json`;
            let filepath = join(this.backupDir, 'active', filename);
            
            // Check active directory first
            if (!existsSync(filepath)) {
                // Check archive directory
                filepath = join(this.backupDir, 'archive', filename);
                if (!existsSync(filepath)) {
                    // Check old location for backward compatibility
                    filepath = join(this.backupDir, '666.json');
                    if (!existsSync(filepath)) {
                        console.error(gradient(['red', 'darkred'])(`❌ Backup not found: ${backupId}`));
                        return null;
                    }
                }
            }

            const data = readFileSync(filepath, 'utf-8');
            const backupData = JSON.parse(data) as BackupData;
            console.log(gradient(['cyan', 'blue'])(`📂 Backup loaded: ${backupData.name}`));
            return backupData;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(gradient(['red', 'darkred'])(`❌ Failed to load backup: ${errorMessage}`));
            return null;
        }
    }

    /**
     * List all backups
     */
    public listBackups(includeArchived: boolean = false): any[] {
        const metadata = this.loadMetadata();
        if (includeArchived) {
            return metadata.backups;
        }
        return metadata.backups.filter((b: any) => b.status === 'active');
    }

    /**
     * Archive a backup
     */
    public archiveBackup(backupId: string): boolean {
        try {
            const filename = `${backupId}.json`;
            const activePath = join(this.backupDir, 'active', filename);
            const archivePath = join(this.backupDir, 'archive', filename);

            if (existsSync(activePath)) {
                const data = readFileSync(activePath, 'utf-8');
                writeFileSync(archivePath, data, 'utf-8');
                unlinkSync(activePath);

                // Update metadata
                const metadata = this.loadMetadata();
                const backup = metadata.backups.find((b: any) => b.id === backupId);
                if (backup) {
                    backup.status = 'archived';
                    backup.archivedAt = new Date().toISOString();
                    backup.filepath = archivePath;
                    metadata.lastUpdated = new Date().toISOString();
                    this.saveMetadata(metadata);
                }

                console.log(gradient(['yellow', 'orange'])(`📦 Backup archived: ${backupId}`));
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(gradient(['red', 'darkred'])(`❌ Failed to archive backup: ${errorMessage}`));
            return false;
        }
    }

    /**
     * Delete a backup permanently
     */
    public deleteBackup(backupId: string): boolean {
        try {
            const filename = `${backupId}.json`;
            const paths = [
                join(this.backupDir, 'active', filename),
                join(this.backupDir, 'archive', filename)
            ];

            let deleted = false;
            for (const path of paths) {
                if (existsSync(path)) {
                    unlinkSync(path);
                    deleted = true;
                    break;
                }
            }

            if (deleted) {
                // Update metadata
                const metadata = this.loadMetadata();
                metadata.backups = metadata.backups.filter((b: any) => b.id !== backupId);
                metadata.lastUpdated = new Date().toISOString();
                this.saveMetadata(metadata);

                console.log(gradient(['red', 'darkred'])(`🗑️ Backup deleted: ${backupId}`));
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(gradient(['red', 'darkred'])(`❌ Failed to delete backup: ${errorMessage}`));
            return false;
        }
    }

    /**
     * Get backup statistics
     */
    public getStats(): any {
        const metadata = this.loadMetadata();
        const active = metadata.backups.filter((b: any) => b.status === 'active');
        const archived = metadata.backups.filter((b: any) => b.status === 'archived');
        
        const totalSize = metadata.backups.reduce((sum: number, b: any) => sum + (b.size || 0), 0);
        
        return {
            total: metadata.backups.length,
            active: active.length,
            archived: archived.length,
            totalSize: totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            lastUpdated: metadata.lastUpdated
        };
    }

    /**
     * Clean up old backups (older than specified days)
     */
    public cleanupOldBackups(daysOld: number = 30): number {
        try {
            const metadata = this.loadMetadata();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            let cleaned = 0;
            metadata.backups = metadata.backups.filter((backup: any) => {
                const backupDate = new Date(backup.createdAt);
                if (backupDate < cutoffDate && backup.status === 'archived') {
                    this.deleteBackup(backup.id);
                    cleaned++;
                    return false;
                }
                return true;
            });

            if (cleaned > 0) {
                metadata.lastUpdated = new Date().toISOString();
                this.saveMetadata(metadata);
                console.log(gradient(['yellow', 'orange'])(`🧹 Cleaned up ${cleaned} old backup(s)`));
            }

            return cleaned;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(gradient(['red', 'darkred'])(`❌ Failed to cleanup backups: ${errorMessage}`));
            return 0;
        }
    }

    /**
     * Export database statistics to file
     */
    public exportStats(filepath?: string): string {
        const stats = this.getStats();
        const backups = this.listBackups(true);
        
        const report = {
            generatedAt: new Date().toISOString(),
            statistics: stats,
            backups: backups
        };

        const exportPath = filepath || join(this.backupDir, `stats_${Date.now()}.json`);
        writeFileSync(exportPath, JSON.stringify(report, null, 2), 'utf-8');
        
        console.log(gradient(['cyan', 'blue'])(`📊 Statistics exported to: ${exportPath}`));
        return exportPath;
    }
}

// Export singleton instance
export const backupDb = new BackupDatabase();
