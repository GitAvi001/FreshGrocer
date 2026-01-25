
import axios from 'axios';

const GATEWAY_URL = 'http://localhost:3000';
const LOG_PREFIX = '[Integration Test]';

async function runVerification() {
    console.log(`${LOG_PREFIX} Starting verification...`);

    // Randomize user to avoid conflicts on repeated runs
    const timestamp = Date.now();
    const testUser = {
        email: `testuser_${timestamp}@example.com`,
        password: 'Password123!',
    };

    const testProduct = {
        name: `Test Product ${timestamp}`,
        description: 'A product for integration testing',
        price: 19.99,
        stockQuantity: 100,
        category: 'Test',
    };

    try {
        // 1. Health Check
        console.log(`\n${LOG_PREFIX} 1. Checking Gateway Health...`);
        try {
            const healthRes = await axios.get(`${GATEWAY_URL}/health`);
            console.log(`${LOG_PREFIX} ✅ Health Check Passed:`, healthRes.data);
        } catch (e) {
            console.error(`${LOG_PREFIX} ❌ Health Check Failed. Is the Gateway running?`);
            process.exit(1);
        }

        // 2. Register User
        console.log(`\n${LOG_PREFIX} 2. Registering User...`);
        try {
            const registerRes = await axios.post(`${GATEWAY_URL}/auth/register`, testUser);
            console.log(`${LOG_PREFIX} ✅ User Registered:`, registerRes.data);
        } catch (e: any) {
            console.log(`${LOG_PREFIX} ❌ Registration Failed:`, e.response?.data || e.message);
            // Continue, maybe user already exists (though we randomized)
        }

        // 3. Login User
        console.log(`\n${LOG_PREFIX} 3. Logging in...`);
        let userId: number;
        let userToken: string = ''; // If auth service returns token

        // NOTE: Based on previous context, auth service might return user object directly or token
        const loginRes = await axios.post(`${GATEWAY_URL}/auth/login`, testUser);

        if (loginRes.data) {
            console.log(`${LOG_PREFIX} ✅ Login Successful`);
            // Adjust based on actual response structure. 
            // Assuming response might be { user: { id, email }, access_token: ... } or just user.
            // For now, let's try to extract ID.
            userId = loginRes.data.user?.id || loginRes.data.id;
            console.log(`${LOG_PREFIX} -> User ID: ${userId}`);

            if (!userId) {
                // Try to fetch user to get ID if not in login response
                console.log(`${LOG_PREFIX} User ID not found in login response, fetching user details...`);
                const userRes = await axios.get(`${GATEWAY_URL}/users/${testUser.email}`);
                userId = userRes.data.id;
                console.log(`${LOG_PREFIX} -> User ID fetched: ${userId}`);
            }
        } else {
            throw new Error('Login returned no data');
        }

        // 4. Create Product
        console.log(`\n${LOG_PREFIX} 4. Creating Product...`);
        const productRes = await axios.post(`${GATEWAY_URL}/products`, testProduct);
        console.log(`${LOG_PREFIX} ✅ Product Created:`, productRes.data);
        const productId = productRes.data.id;

        // 5. Create Order
        console.log(`\n${LOG_PREFIX} 5. Creating Order...`);
        const orderPayload = {
            userId: userId, // Ensure this is a number
            deliveryAddress: '123 Test St, Test City',
            items: [
                {
                    productId: productId,
                    quantity: 2
                }
            ]
        };

        // Note: The controller expects 'createOrderDto' body.
        const orderRes = await axios.post(`${GATEWAY_URL}/orders`, orderPayload);
        console.log(`${LOG_PREFIX} ✅ Order Created:`, orderRes.data);
        const orderId = orderRes.data.id;

        // 6. Verify Order Details
        console.log(`\n${LOG_PREFIX} 6. Verifying Order Details...`);
        const getOrderRes = await axios.get(`${GATEWAY_URL}/orders/${orderId}`);

        if (getOrderRes.data.id === orderId && getOrderRes.data.totalPrice) {
            console.log(`${LOG_PREFIX} ✅ Order Verified: ID matches and price calculated.`);
            console.log(`${LOG_PREFIX} -> Total Price: ${getOrderRes.data.totalPrice}`);
        } else {
            console.log(`${LOG_PREFIX} ❌ Order Verification could not confirm details:`, getOrderRes.data);
        }

        // 7. Verify Stock Update
        console.log(`\n${LOG_PREFIX} 7. Verifying Stock Update...`);
        const getProductRes = await axios.get(`${GATEWAY_URL}/products/${productId}`);
        const initialStock = testProduct.stockQuantity;
        const currentStock = getProductRes.data.stockQuantity;
        const expectedStock = initialStock - 2;

        if (Number(currentStock) === expectedStock) {
            console.log(`${LOG_PREFIX} ✅ Stock Updated Correctly: ${initialStock} -> ${currentStock}`);
        } else {
            console.log(`${LOG_PREFIX} ❌ Stock Update Verification Failed. Expected ${expectedStock}, got ${currentStock}`);
        }

        console.log(`\n${LOG_PREFIX} ✨ Verification Complete!`);

    } catch (error: any) {
        console.error(`\n${LOG_PREFIX} ❌ Verification Failed Check:`, error.message);
        if (error.response) {
            console.error(`${LOG_PREFIX} Data:`, JSON.stringify(error.response.data, null, 2));
            console.error(`${LOG_PREFIX} Status:`, error.response.status);
        }
    }
}

runVerification();
