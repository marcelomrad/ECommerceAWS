import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import  {Product, ProductRepository} from "/opt/nodejs/productsLayer";
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

    if(event.resource === "/products"){
      const product = JSON.parse(event.body!) as Product;
      const procuctCreated = await productRepository.createProduct(product);

      return{
        statusCode: 201,
        body: JSON.stringify(procuctCreated)
      }

    } else if(event.resource === "/products/{id}"){
        const productId = event.pathParameters!.id as string;

        if(event.httpMethod === "PUT"){
            const product = JSON.parse(event.body!) as Product;

            try{
                const productUpdated = await productRepository.updateProduct(productId, product);
    
                return{
                    statusCode: 200,
                    body: JSON.stringify(productUpdated)
                }

            }catch (ConditionalCheckFailedException){
                return{
                    statusCode: 404,
                    body: JSON.stringify({
                        message: "Product not found"
                    })
                }
            }

        } else if(event.httpMethod === "DELETE"){
            try{
                const product = await productRepository.deleteProduct(productId);

                return{
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
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Bad Request"
        })
    }


}
