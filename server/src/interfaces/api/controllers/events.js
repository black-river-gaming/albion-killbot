const eventsService = require("../../../services/events");
const { generateEventImage } = require("../../../services/images");

async function getEvent(req, res) {
  const { eventId } = req.params;

  const event = await eventsService.getEvent(eventId);
  if (!event) return res.sendStatus(404);

  return res.send(event);
}

async function getEventImage(req, res) {
  const { eventId } = req.params;

  const event = await eventsService.getEvent(eventId);
  if (!event) return res.sendStatus(404);

  const eventImage = await generateEventImage(event);

  return res.set("Content-Disposition", `inline; filename="${event.EventId}-event.png"`).type("png").send(eventImage);
}

module.exports = {
  getEvent,
  getEventImage,
};
