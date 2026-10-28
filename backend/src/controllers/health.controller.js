const startedAt = Date.now();

// GET /api/v1/health — liveness probe that also demonstrates the response
// envelope every endpoint uses: { success: true, ... }.
export const getHealth = (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    uptime: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
};
