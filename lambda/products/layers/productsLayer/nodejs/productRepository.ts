import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Product {
    id: string,
    productName: string,
    code: string,
    price: number,
    model: string,
}

export class ProductRepository {
    private ddbClient: DocumentClient;
    private productsDdb: string;

    constructor(ddbClient: DocumentClient, productsDdb: string) {
        this.ddbClient = ddbClient
        this.productsDdb = productsDdb
    }

    async getAllProducts() : Promise<Product[]> {
        const data = await this.ddbClient.scan({
            TableName: this.productsDdb
        }).promise()
        return data.Items as Product[]
    }

    async getProductById(productId: string) : Promise<Product> {
        const data = await this.ddbClient.get({
            TableName: this.productsDdb,
            Key: {
                id: productId
            }
        }).promise()

        if(data.Item) {
            return data.Item as Product
        }else {
            throw new Error("Product not found")
        }
    }

    async createProduct(product: Product) : Promise<Product> {
        product.id =  uuidv4()
        await this.ddbClient.put({
            TableName: this.productsDdb,
            Item: product
        }).promise()

        return product
    }

    async deleteProduct(productId: string) : Promise<Product>{
        const data = await this.ddbClient.delete({
            TableName: this.productsDdb,
            Key: {
                id: productId
            },
            ReturnValues: "ALL_OLD" //retornar o item que foi deletado
        }).promise()

        if(data.Attributes) {
            return data.Attributes as Product
        }else {
            throw new Error("Product not found")
        }
    }

    async updateProduct(productId: string, product: Product) : Promise<Product> {
        const data = await this.ddbClient.update({
            TableName: this.productsDdb,
            Key: {
                id: productId
            },
            ConditionExpression: "attribute_exists(id)", //verificar se o produto existe
            UpdateExpression: "set productName = :productName, code = :code, price = :price, model = :model",
            ExpressionAttributeValues: {
                ":productName": product.productName,
                ":code": product.code,
                ":price": product.price,
                ":model": product.model
            },
            ReturnValues: "UPDATED_NEW" //retornar o item que foi atualizado
        }).promise()

        data.Attributes!.id = productId
        return data.Attributes as Product
    }
}