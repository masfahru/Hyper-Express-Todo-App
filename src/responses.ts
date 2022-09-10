import { Response } from 'hyper-express';

export const GetResponse = (res: Response, data: any) => {
  return res
    .status(200)
    .header('Connection', 'keep-alive')
    .header('Keep-Alive', 'timeout=5')
    .header('Content-Type', 'application/json')
    .send(
      JSON.stringify({
        status: 'Success',
        message: 'Success',
        data,
      }),
    )
    .end();
};

export const CreateResponse = (res: Response, data: any) => {
  return res
    .status(201)
    .header('Connection', 'keep-alive')
    .header('Keep-Alive', 'timeout=5')
    .header('Content-Type', 'application/json; charset=utf-8')
    .send(
      JSON.stringify({
        status: 'Success',
        message: 'Success',
        data,
      }),
    )
    .end();
};

export const NotfoundResponse = (res: Response, message: string) => {
  return res
    .status(404)
    .header('Connection', 'keep-alive')
    .header('Keep-Alive', 'timeout=5')
    .header('Content-Type', 'application/json; charset=utf-8')
    .send(
      JSON.stringify({
        status: 'Not Found',
        message,
        data: null,
      }),
    )
    .end();
};

export const BadRequestResponse = (res, message) => {
  return res
    .status(400)
    .header('Connection', 'keep-alive')
    .header('Keep-Alive', 'timeout=5')
    .header('Content-Type', 'application/json; charset=utf-8')
    .send(
      JSON.stringify({
        status: 'Bad Request',
        message,
        data: null,
      }),
    )
    .end();
};
