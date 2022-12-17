export function solveDijkstra<TNode>(allCells: readonly TNode[], startCell: TNode, getNeighbors: (cell: TNode) => readonly TNode[]) {
    const distances = new Map<TNode, number>(allCells.map(cell => [ cell, Infinity ]));
    const predecessors = new Map<TNode, TNode | null>(allCells.map(cell => [ cell, null ]));
    const remainingCells = new Set(allCells);

    distances.set(startCell, 0);

    while(remainingCells.size > 0) {
        const currentCell = [...remainingCells].sort((a, b) => distances.get(a)! - distances.get(b)!).at(0)!;
        remainingCells.delete(currentCell);

        getNeighbors(currentCell)
            .filter(neighbor => remainingCells.has(neighbor))
            .forEach(neighbor => {
                const alternativeDistance = distances.get(currentCell)! + 1;
                if(alternativeDistance < distances.get(neighbor)!) {
                    distances.set(neighbor, alternativeDistance);
                    predecessors.set(neighbor, currentCell);
                }
            });
    }

    return { distances, predecessors }
}
