FROM python:3.9.13

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

ENV NAME back

CMD [ "python", "app.py" ]
