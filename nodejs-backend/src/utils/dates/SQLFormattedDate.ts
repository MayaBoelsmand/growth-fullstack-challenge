// Reference: https://www.geeksforgeeks.org/how-to-convert-javascript-datetime-to-mysql-datetime/

export default function sqlFormattedDate(date: Date) {
  return new Date(date).toISOString().slice(0, 19).replace("T", " ");
}
