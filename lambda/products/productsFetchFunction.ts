import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import  {ProductRepository} from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk";

const productsDdb = process.env.PRODUCTS_DDB! as string;
const ddbClient = new DynamoDB.DocumentClient();

const productRepository = new ProductRepository(ddbClient, productsDdb);

export async function handler(event: APIGatewayProxyEvent, context: Context) : Promise<APIGatewayProxyResult> {

    //log da requisição da aws
    const lambdaRequestId = context.awsRequestId;
    //log da requisição da api
    const apiRquestId = event.requestContext.requestId;

    console.log("Lambda Request ID: " + lambdaRequestId + " - " + "API Request ID: " + apiRquestId);
    console.log("TABELA = " + productsDdb)

    const method = event.httpMethod;

    if(event.resource === "/products"){
        if(method === 'GET'){
            
            const products = await productRepository.getAllProducts();

            return {
                statusCode: 200,
                body: JSON.stringify(products)
            }
        }

    }else if(event.resource === "/products/{id}"){
        const productId = event.pathParameters!.id as string;
        
        try{
            const product = await productRepository.getProductById(productId);

            return {
                statusCode: 200,
                body: JSON.stringify(product)
            }
        }catch (error){
            console.log((<Error>error).message)
            return {
                statusCode: 404,
                body: (<Error>error).message
            }
        }
       
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Bad Request"
        })
    }

}