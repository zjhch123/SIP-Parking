import { TableClient } from '@azure/data-tables';

let db: TableClient;

export const init = () => {
  if (db) { return; }
  db = TableClient.fromConnectionString(process.env['TableConnectionString'], 'Parking');
};

export const addItem = async (ground: number, underground: number) => {
  const task = {
    partitionKey: "p1",
    rowKey: Date.now().toString(),
    ground,
    underground,
  };
  await db.createEntity(task);
};
