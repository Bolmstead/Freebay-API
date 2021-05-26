<br />


<p align="center">
<img src="logo.png?raw=true" width=300 >
</p>
  

  <p align="center">
    The REST API for the FreeBay Web App 
    <br /> 
       <br />
  </p>

# Table of Contents
1. [Products Routes](#Products-Routes)
2. [Authorization Routes](#Authorization-Routes)
3. [User Route](#User-Route)
4. [Notifications Route](#Notifications-Route)
5. [Bids Routes](#Bids-Routes)
6. [Products Won Routes](#Products-Won-Routes)
7. [How to Run a Local Copy](#How-to-Run-a-Local-Copy)
9. [Contact](#Contact)

# Products Routes

## Get Information on Products

`GET /products`
#### Search Parameters to Include in Optional Query String Request:

| Query Name     | Type   | Example            | Description                                        |
|----------------|--------|--------------------|----------------------------------------------------|
| name           | String | iPod               | Products that contain this product name            |
| category       | String | Home and Household | Products that contain this category                |
| sub_category   | String | Movies and TV      | Products that contain this subcategory             |
| description    | String | 70" 4k Television  | Products that contain this description             |
| rating         | Number | 4.2                | Products that have at least this rating            |
| num_of_ratings | Number | 302                | Products that have at least this number of ratings |

### Response:

    {
      "products": [
        {
          "id": 2145,
          "name": "MANGOPOP Women's Mock Turtle Neck Sleeveless Tank Top"
          "category": "Fashion",
          "subCategory": "Womens",
          "description": "Great stretchy fabric  Modal  Spandex",
          "rating": "5",
          "numOfRatings": 1049,
          "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/511iUnHsTXL._AC_UX342_.jpg",
          "startingBid": "13",
          "auctionEndDt": "2021-05-04T17:50:43.037Z",
          "auctionEnded": false,
          "bidderEmail": jimBob@gmail.com,
          "bidderFirstName": Jim,
          "bidderLastName": Bob,
          "bidderUsername": Jimbo,
          "bidPrice": 15,
          "bidId": 2,
          "isHighestBid": true,
          "wasWinningBid": false
        }
      ],
      "numOfProductsInAuction": 1
    }

## Get Information on a Product

### Request:
`GET /product/:id`

### Response:
    {
      "productResult":
        {
          "id":7,
          "name":"Wireless Indoor Cam with Night Vision",
          "category":"Electronics",
          "subCategory":"Photo",
          "description":"This is a great camera.",
          "rating":"4",
          "numOfRatings":1101,
          "imageUrl":"https://images-na.ssl-images-amazon.com/images/I/518Ngm46uuL._AC_SY450_.jpg",
          "startingBid":"20",
          "auctionEndDt":"2021-04-14T23:38:53.238Z",
          "auctionEnded":true,
          "bidderEmail":"olms2074@gmail.com",
          "bidPrice":"35",
          "isHighestBid":true,
          "bidId":27,
          "wasWinningBid":true,
          "bidderUsername":"Bolmstead",
          "numOfBids":"2"
        }
    }


# Authorization Routes

### Register User

`POST /auth/register/`
#### Request:
    {
      "email":  "email@email.com",
      "username": "username",
      "password": "password",
      "firstName": "first",
      "lastName": "last"
    }
#### Response:
    { "token":"abcd123" }

### Login User

`POST /auth/login/`

#### Request:
    {
      "email":  "email@email.com",
      "username": "username"
    }

#### Response:
    { "token":"abcd123" }

# User Route

## Get a Users Information

### Request:

`GET /users/:username`

### Response:

    {
      "email": "email@gmail.com",
      "username": "username",
      "firstName": "firstname",
      "lastName": "lastname",
      "imageUrl": "www.google.com",
      "balance": "78",
      "bids": [],
      "productsWon": [],
      "notifications": []
    }

# Notifications Route

## Set the Logged-In User's Notifications to Viewed

### Request:

`POST /notifications/view/`

### Response:

    { "success" }

# Bids Routes

## Check All Bids and Update Any Products if Auction Ended

### Request:

`GET /bids/check-all-bids-for-ended-auctions`

### Response:

    {
      All bids check for ended auctions. # auctions have ended
    }

## Get Most Recent Bids

### Request:

`GET /bids/recent/:num`

### Response:

    [
      {
        "id": 1554,
        "name": "Cutting Mat for Cricut Maker/Explore Air",
        "category": "Sports, Hobbies, & Misc",
        "subCategory": "Arts and Crafts",
        "description": "Xinart cutting mat x ",
        "rating": "2",
        "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/61BoGCWperL._AC_SY450_.jpg",
        "auctionEndDt": "2021-04-27T10:47:28.962Z",
        "auctionEnded": false,
        "bidId": 40,
        "bidPrice": "2",
        "bidTime": "2021-04-19T02:39:43.311Z",
        "isHighestBid": true,
        "wasWinningBid": false,
        "bidderEmail": "olms2074@gmail.com",
        "username": "username",
        "email": "email@gmail.com"
      }
    ]

## Place a Bid

### Request:

`POST /bids/:productId/placeBid/:amount`

### Response:

    { "success" }

# Products Won Routes

## Get Most Recent Products Won

### Request:

`GET /products-won/recent/:num`

### Response:
    [
      {
        "id":1174,
        "name":"Workout Gear",
        "category":"Fashion",
        "subCategory":"Womens",
        "description":"This is a great product!'",
        "rating":"2",
        "imageUrl":"https://images-na.ssl-images-amazon.com/images/I/61N4IJZixJL._AC_UX385_.jpg",
        "auctionEndDt":"2021-04-25T00:06:10.597Z",
        "auctionEnded":true,"bidPrice":"22",
        "wonTime":"2021-04-26T03:06:26.161Z",
        "username":"asdf",
        "email":"asdfadsf@gmail.com",
        "userImageUrl":"fasdfasdf"
      }
    ]

# How to Run a Local Copy

To get a local copy of the API up and running follow these steps:

### Clone Repo

1. Clone the backend repo to a separate directory by going to [https://github.com/freebay-backend](https://github.com/freebay-backend). From there, click Download Zip again from the green Code button at the top of the page or enter the following in a separate directory in your terminal:
   ```sh
   git clone https://github.com/Bolmstead/freebay-backend.git
   ```

### Library Installations

2. After cloning each repo (and unzipping if downloaded), install the libraries in the backend repo.

    ```sh
    npm install
    ```

### Postgres Installation

3. Install [Postgres](https://www.postgresql.org/).
4. Create a database named "freebay" in your terminal in the backend directory.
    ```sh
    createdb freebay
    ```

### Seed Products to Database 

6. Run the following command in your terminal in the backend directory to create the database tables and seed products to database.
    ```sh
    psql -d freebay -f SeedTablesAndProducts.sql
    ```

7. Start your server in the appropriate directory and you are done!

# Contact

Berkley Olmstead - olms2074@gmail.com - [Linkedin](https://www.linkedin.com/in/berkleyolmstead/)

Project Links: <br/>
[Live Site](https://freebay.netlify.app/)<br/>
[https://github.com/freebay-frontend](https://github.com/freebay-frontend) <br/>
               [https://github.com/freebay-backend](https://github.com/freebay-backend)