
#  Postman Collection

This Postman collection tests and validates key RMS booking-related API endpoints, covering availability, booking creation, and cart retrieval. It features comprehensive automated tests for response correctness and extracts environment variables to chain requests dynamically.

---

## Collection Overview

### Requests

1. **Refresh Data**
    - GET request to refresh or initialize API data.
    - No specific tests or environment variable extraction.

2. **GetAvailRatesData**  
   - **Method:** GET  
   - **Endpoint:** `/OnlineApi/GetAvailRatesData`
   - **Tests Validate:**  
     - HTTP status 200  
     - Presence and array type of `dateGrid`  
     - `categoryRows` array presence and non-empty  
     - Each category contains required fields (`categoryName`, `categoryDescription`, `currencyCode`, `anyAvailRates`, `maxOccupancy`, `averageNightlyRateFrom`) with correct types  
     - Each tariff includes required fields (`id`, `tariffName`, `tariffDescription`, `bookingAllowed`, `isAvailable`, `noOfAvailArrival`, `addCartURL`, `loadCartURL`, `nextURL`, `maxRoomQuantity`) and that `dates` is an array with proper date and price fields  
   - **Environment Variables Set:**  
     - `arriveDate` and `departDate` from `searchCriteria`  
     - `bedAndBreakfastAddCartURL` (the addCartURL for "Bed & Breakfast" tariff)  
     - `bookingTariff` (booking tariff amount)  
     - `tariffName` (usually "Bed & Breakfast")  

3. **AddBooking**  
   - **Method:** GET  
   - **Endpoint:** Uses the dynamic `bedAndBreakfastAddCartURL` with appended parameters `adults={{adultsCount}}&children=0&infants=0&CartId`  
   - **Tests Validate:**  
     - HTTP status 200  
     - Presence of top-level fields: `cartId` (string), `nGrandTotal` (number), `sCurrencyCode` (string), `oSiblings` (array)  
     - First sibling's details match environment variables:  
       - Number of adults (`nAdults`)  
       - Tariff name (`sRate`)  
       - Subtotal amount (`nSubTotal`)  
       - Arrival date (`dArrival`)  
       - Departure date (`dDeparture`)  
   - **Environment Variables Set:**  
     - `cartId`  

4. **getCart**  
   - **Method:** GET  
   - **Endpoint:** `/OnlineApi/GetCart` with query params:  
     - `clientId=22749`  
     - `agentId=1`  
     - `CartId={{cartId}}`  
   - **Tests Validate:**  
     - HTTP status 200  
     - `cartId` matches environment variable  
     - First sibling's `nAdults`, `nTariff`, `sRate`, `dArrival`, `dDeparture`, `sRoom` all match environment variables (`adultsCount`, `bookingTariff`, `tariffName`, `arriveDate`, `departDate`, `roomType`)  

---

## Environment Variables

| Variable Name                 | Description                                               | Example Value                      |
|------------------------------|-----------------------------------------------------------|----------------------------------|
| `baseUrl`                    | Base URL for the API                                       | `https://alphaibe12.rmscloud.com`|
| `adultsCount`                | Number of adults for booking                              | `2`                              |
| `bedAndBreakfastAddCartURL`  | Add to cart URL for "Bed & Breakfast" tariff             | Extracted dynamically            |
| `bookingTariff`              | Tariff amount for the booking                             | Extracted dynamically            |
| `tariffName`                 | Name of the tariff (usually "Bed & Breakfast")           | `Bed & Breakfast`                |
| `cartId`                    | Cart identifier returned after adding booking             | Extracted dynamically            |
| `arriveDate`                 | Arrival date from availability data                       | Extracted dynamically            |
| `departDate`                 | Departure date from availability data                     | Extracted dynamically            |
| `roomType`                  | Room type from booking or cart data                        | Extracted or set externally      |

---

## How to Use

1. **Import** the `rms-qa` Postman collection into Postman.

2. **Set initial environment variables:**  
   - `baseUrl` (API base URL)  
   - `adultsCount` (number of adults)  
   - Optionally set `roomType` if applicable.

3. **Execute requests in the following sequence:**  
   - `Refresh Data` (optional)  
   - `GetAvailRatesData` (populates tariffs and dates)  
   - `AddBooking` (creates booking using extracted addCartURL)  
   - `getCart` (retrieves booking/cart details for verification)  

4. **Review test results and environment variable updates:**  
   - Dynamic extraction and validation ensure correct chaining and data integrity between requests.

---

## Why These APIs
They reflect critical booking system flows from search to
booking confirmation, enabling end-to-end validation of
the RMS booking process. Automating these tests helps
ensure booking integrity, pricing accuracy, and correct
guest information management.
---
