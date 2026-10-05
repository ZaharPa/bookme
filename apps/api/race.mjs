const url = "http://localhost:3000/bookings";
const headers = {
  "Content-Type": "application/json",
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMmVmODliNy03YWM5LTQzMTUtYWNlNC03YzM4MDA1NjZlNGEiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3OTExOTE2NDcsImV4cCI6MTc5MTE5MjU0N30.toBWaVaotrmqvI68MPOAvtscsbdHrb3VeOGAUOLsdPg",
};
const body = JSON.stringify({
  resourceId: "79c10621-f880-4fad-96f3-0bdbba215ab0",
  startTime: "2026-10-11T10:00:00Z",
  endTime: "2026-10-11T12:00:00Z",
});

const statuses = await Promise.all(
  Array.from({ length: 5 }, () =>
    fetch(url, { method: "POST", headers, body }).then((r) => r.status),
  ),
);
console.log(statuses);
