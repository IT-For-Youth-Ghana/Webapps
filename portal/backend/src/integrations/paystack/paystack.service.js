/**
 * Paystack Integration Service
 * Handles payment processing via Paystack API
 */

import crypto from 'crypto';
import logger from '../../utils/logger.js';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

class PaystackService {
    constructor() {
        this.baseUrl = PAYSTACK_BASE_URL;
        this.secretKey = PAYSTACK_SECRET_KEY;
    }

    /**
     * Make API call to Paystack
     */
    async callApi(endpoint, method = 'GET', body = null) {
        try {
            const options = {
                method,
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json',
                },
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            const data = await response.json();

            if (!data.status) {
                throw new Error(data.message || 'Paystack API error');
            }

            return data.data;
        } catch (error) {
            logger.error('Paystack API call failed', { endpoint, error: error.message });
            throw error;
        }
    }

    /**
     * Initialize a transaction
     */
    async initializeTransaction({ email, amount, reference, metadata = {}, callbackUrl = null }) {
        try {
            const payload = {
                email,
                amount: Math.round(amount * 100), // Convert to kobo/pesewas
                reference,
                metadata,
            };

            if (callbackUrl) {
                payload.callback_url = callbackUrl;
            }

            const result = await this.callApi('/transaction/initialize', 'POST', payload);

            logger.info(`Payment initialized: ${reference}`, { amount, email });

            return {
                authorization_url: result.authorization_url,
                access_code: result.access_code,
                reference: result.reference,
            };
        } catch (error) {
            logger.error('Failed to initialize Paystack transaction', { email, amount, error: error.message });
            throw error;
        }
    }

    /**
     * Verify a transaction
     */
    async verifyTransaction(reference) {
        try {
            const result = await this.callApi(`/transaction/verify/${reference}`);

            logger.info(`Payment verified: ${reference}`, { status: result.status });

            return {
                status: result.status,
                amount: result.amount / 100, // Convert from kobo/pesewas
                channel: result.channel,
                currency: result.currency,
                paidAt: result.paid_at,
                metadata: result.metadata,
            };
        } catch (error) {
            logger.error('Failed to verify Paystack transaction', { reference, error: error.message });
            throw error;
        }
    }

    /**
     * List transactions
     */
    async listTransactions({ perPage = 50, page = 1, status = null } = {}) {
        let endpoint = `/transaction?perPage=${perPage}&page=${page}`;

        if (status) {
            endpoint += `&status=${status}`;
        }

        return await this.callApi(endpoint);
    }

    /**
     * Get transaction details
     */
    async getTransaction(id) {
        return await this.callApi(`/transaction/${id}`);
    }

    /**
     * Validate Paystack webhook signature
     */
    validateWebhookSignature(payload, signature) {
        if (!signature || !this.secretKey) {
            return false;
        }

        const body = Buffer.isBuffer(payload)
            ? payload
            : typeof payload === 'string'
                ? payload
                : JSON.stringify(payload);

        const hash = crypto
            .createHmac('sha512', this.secretKey)
            .update(body)
            .digest('hex');

        return hash === signature;
    }
}

export default new PaystackService();
