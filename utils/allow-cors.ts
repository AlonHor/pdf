const allowCors = (handler: any) => async (req: any, res: any) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  return await handler(req, res);
};

export default allowCors;
