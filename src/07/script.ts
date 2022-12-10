import { readFile } from 'fs/promises';
import { EOL } from 'os';

class FileNode {
    readonly type = 'file';

    constructor(readonly name: string, readonly size: number, readonly level: number) {}
}

class DirectoryNode {
    readonly type = 'dir';

    readonly subDirectories = new Map<string, DirectoryNode>();
    readonly files = new Map<string, FileNode>();

    constructor(readonly name: string, readonly level: number, readonly parent: DirectoryNode | null) {}

    get size(): number {
        return this.getFiles().reduce((sum, file) => sum + file.size, 0);
    }

    getFiles(predicate: (file: FileNode) => boolean = () => true): readonly FileNode[] {
        return [
            ...Array.from(this.files.values()).filter(predicate),
            ...Array.from(this.subDirectories.values()).flatMap(subDir => subDir.getFiles(predicate))
        ]
    }

    getDirectories(predicate: (directory: DirectoryNode) => boolean = () => true): readonly DirectoryNode[] {
        return [
            ...Array.from(this.subDirectories.values()).filter(predicate),
            ...Array.from(this.subDirectories.values()).flatMap(subDir => subDir.getDirectories(predicate))
        ]
    }

    visit(visitor: (me: DirectoryNode | FileNode) => void) {
        visitor(this);
        this.files.forEach(file => visitor(file));

        this.subDirectories.forEach(dir => dir.visit(visitor));
    }

    ensureSubDirectory(path: string): DirectoryNode {
        const subDirectory = this.subDirectories.get(path) ?? new DirectoryNode(path, this.level + 1, this);
        this.subDirectories.set(path, subDirectory);
        return subDirectory;
    }

    ensureFile(name: string, size: number): void {
        const file = this.files.get(name) ?? new FileNode(name, size, this.level + 1);
        this.files.set(name, file);
    }
}

const lines = (await readFile('input.txt'))
        .toString()
        .split(`${EOL}`)
        .slice(1);

const processNextLine = (currentDirectory: DirectoryNode) => {
    const line = lines.shift();
    let nextDirectory = currentDirectory;

    if(line === undefined) {
        return;
    }

    const cdCommand = line.match(/\$ cd (?<path>.+)/);
    if(cdCommand !== null) {
        const { path } = cdCommand.groups!;
        
        if(path === '..') {
            nextDirectory = currentDirectory.parent ?? currentDirectory;
        } else {
            nextDirectory = currentDirectory.ensureSubDirectory(path)
        }
    }

    const isLsCommand = /\$ ls/.test(line);
    if(isLsCommand) {
        // skip ls commands
    }

    const dirOutput = line.match(/dir (?<name>.+)/);
    if(dirOutput !== null) {
        const { name } = dirOutput.groups!;
        currentDirectory.ensureSubDirectory(name);
    }

    const fileOutput = line.match(/(?<sizeStr>\d+) (?<name>.+)/);
    if(fileOutput !== null) {
        const { name, sizeStr } = fileOutput.groups!
        const size = parseInt(sizeStr);
        currentDirectory.ensureFile(name, size);
    }

    processNextLine(nextDirectory);
}

const root = new DirectoryNode('/', 0, null);
processNextLine(root);

// ----- Part 1 --------

const dirs = root.getDirectories(dir => dir.size <= 100000);
console.log('Part 1:', dirs.reduce((sum, dir) => sum + dir.size, 0));

// ----- Part 2 --------

const availableSpace = 70000000;
const requiredFreeSpace = 30000000;

const usedSpace = root.size;
const spaceNeededToFree = requiredFreeSpace - (availableSpace - usedSpace);

// assuming that at least root is large enough to free required space
const dirsLargeEnough = [ root, ...root.getDirectories(dir => dir.size > spaceNeededToFree)];
dirsLargeEnough.sort((a, b) => a.size - b.size);

console.log('Part 2:', dirsLargeEnough[0].size);