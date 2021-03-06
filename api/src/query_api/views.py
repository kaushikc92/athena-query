from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from tempfile import TemporaryFile

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser

import boto3
from botocore.client import Config
import requests

import os

# Create your views here.
class UploadTableView(APIView):
    parser_class = (MultiPartParser, FormParser)

    def post(self, request):
        table_name = request.data['table_name']
        data_url = request.data['data_url']
        schema_url = request.data['schema_url']

        s3 = boto3.client(
            's3',
            region_name = 'us-east-1',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

        response = requests.get(data_url)
        with TemporaryFile() as tf:
            tf.write(response.content)
            object_path = table_name + '/' + 'data.csv'
            tf.seek(0,0)
            s3.upload_fileobj(tf, settings.AWS_STORAGE_BUCKET_NAME, object_path)

        response = requests.get(schema_url)
        schema = str(response.content, 'utf-8').rstrip()

        query_string = (
            'CREATE EXTERNAL TABLE IF NOT EXISTS '
            + table_name
            + '('
            + schema
            + ')'
            + ' ROW FORMAT SERDE \'org.apache.hadoop.hive.serde2.OpenCSVSerde\''
            + ' LOCATION \'s3://'
            + settings.AWS_STORAGE_BUCKET_NAME
            + '/'
            + table_name
            + '/\''
            + ' TBLPROPERTIES ('
            + ' \'skip.header.line.count\' = \'1\''
            + ' )'
        )

        athena = boto3.client(
            'athena',
            region_name = 'us-east-1',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

        athena.start_query_execution(
            QueryString = query_string,
            QueryExecutionContext = {
                'Database': 'lakesites'
            },
            ResultConfiguration = {
                'OutputLocation': 's3://' + settings.AWS_STORAGE_BUCKET_NAME + '/output/'
            }
        )

        return Response(status=status.HTTP_201_CREATED)

class RunQueryView(APIView):
    parser_class = (MultiPartParser, FormParser)

    def post(self, request):
        query_string = request.data['query']
        athena = boto3.client(
            'athena',
            region_name = 'us-east-1',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
        response = athena.start_query_execution(
            QueryString = query_string,
            QueryExecutionContext = {
                'Database': 'lakesites'
            },
            ResultConfiguration = {
                'OutputLocation': 's3://lake-data/output/'
            }
        )
        return Response({'queryExecutionId': response['QueryExecutionId']}, status=status.HTTP_201_CREATED)

class QueryStatusView(APIView):
    parser_class = (JSONParser,)

    def get(self, request):
        queryExecutionId = request.query_params['query_id']
        athena = boto3.client(
            'athena',
            region_name = 'us-east-1',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
        response = athena.get_query_execution(
            QueryExecutionId = queryExecutionId
        )
        data = {}
        state = response['QueryExecution']['Status']['State']
        data['state'] = state
        if 'EngineExecutionTimeInMillis' in response['QueryExecution']['Statistics']:
            data['runtime'] = response['QueryExecution']['Statistics']['EngineExecutionTimeInMillis']
        if state == 'SUCCEEDED':
            s3 = boto3.client(
                's3',
                region_name = 'us-east-1',
                config=Config(signature_version='s3v4'),
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )

            data['downloadUrl'] = s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                    'Key': 'output/' + queryExecutionId + '.csv'
                },
                ExpiresIn=3600
            )

        return Response(data, status=status.HTTP_200_OK)

class ClientIdView(APIView):
    parser_class = (JSONParser,)

    def get(self, request):
        client_id = os.environ['COLUMBUS_CLIENT_ID']
        return Response({"client_id": client_id})

class AuthenticationTokenView(APIView):
    parser_class = (JSONParser,)

    @csrf_exempt
    def post(self, request, format=None):
        code = request.data['code']
        redirect_uri = request.data['redirect_uri']
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': os.environ['COLUMBUS_CLIENT_ID'],
            'client_secret': os.environ['COLUMBUS_CLIENT_SECRET']
        }
        response = requests.post(url='http://authentication.columbusecosystem.com/o/token/', data=data)

        return Response(response.json(), status=response.status_code)

class SaveToCDriveView(APIView):
    parser_class = (JSONParser,)

    @csrf_exempt
    def post(self, request, format=None):
        access_token = request.data['access_token']
        download_url = request.data['download_url']
        path = request.data['path']

        start_index = path.rfind('/')
        parent_path = path[0 : start_index]
        file_name = path[start_index + 1 : len(path)]
        r = requests.get(url=download_url)
        with open('result.csv', 'wb+') as f:
            f.write(r.content)
            f.seek(0)
            file_arg = {'file': (file_name, f), 'path': (None, parent_path)}
            response = requests.post('https://api.cdrive.columbusecosystem.com/upload/', files=file_arg, headers={'Authorization':'Bearer ' + access_token})

        return Response(status=200)
