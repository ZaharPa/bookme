import express from "express";

const router: express.Router = express.Router();

router.get("/mine");
router.get("/business/mine");
router.get("/:bookingId");
router.post("/");
router.patch("/:bookingId/status");
router.patch("/:bookingId/cancel");

export default router;
