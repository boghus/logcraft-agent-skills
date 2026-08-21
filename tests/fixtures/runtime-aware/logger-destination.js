export function createDestination() {
  return {
    write(event) {
      console.error(event.message)
    }
  }
}
