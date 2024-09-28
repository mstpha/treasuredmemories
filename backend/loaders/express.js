import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import { prefix } from "./../config/index.js";
import routes from "./../routes/index.js";
import bodyParser from "body-parser";

export default (app) => {
  app.enable("trust proxy");
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(helmet());
  app.use(compression());
  app.use(express.static("public"));
  app.disable("x-powered-by");
  app.disable("etag");

  app.use(prefix, routes);

  app.get("/", (_req, res) => {
    return res
      .status(200)
      .json({
        resultMessage: {
          msg: "Project is successfully working...",
        },
      })
      .end();
  });

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Content-Security-Policy-Report-Only", "default-src: https:");
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT POST PATCH DELETE GET");
      return res.status(200).json({});
    }
    next();
  });

  app.use((_req, _res, next) => {
   
    return _res
      .status(404)
      .json({
        resultMessage: {
          err: "Endpoint could not be found!",
        },
      })
      .end();
  });
};
