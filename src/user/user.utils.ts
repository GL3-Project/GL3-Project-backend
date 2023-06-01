export const objectToCsv = <T extends object>(data: T[]): string => {
  const csvRows: string[] = [];

  /* Get headers as every csv data format
  has header (head means column name)
  so objects key is nothing but column name
  for csv data using Object.key() function.
  We fetch key of object as column name for
  csv */
  const headers = Object.keys(data[0]);

  /* Using push() method we push fetched
     data into csvRows[] array */
  csvRows.push(headers.join(','));

  // Loop to get value of each object key
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      return `"${val}"`;
    });

    // To add, separator between each value
    csvRows.push(values.join(','));
  }

  /* To add new line for each objects values
     and this return statement array csvRows
     to this function.*/
  return csvRows.join('\n');
};
