import dotenv from 'dotenv';
dotenv.config();
const { SHOPIFY_VERSION } = process.env;

export const ShopifyService = {
    create: async ({ domain, token }) => {
        try {
            const query = JSON.stringify({
                query: `
            mutation webPixelCreate($webPixel: WebPixelInput!) {
                webPixelCreate(webPixel: $webPixel) {
                    userErrors {
                        field
                        message
                    }
                    webPixel {
                        id
                    }
                }
            }
            `,
                variables: {
                    webPixel: {
                        settings: `{"domain":"${domain}"}`,
                    },
                },
            });

            console.log(domain)
            console.log(token)
            console.log(SHOPIFY_VERSION)

            const res = await fetch(`https://${domain}/admin/api/${SHOPIFY_VERSION}/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': token,
                },
                body: query,
            }).catch();

            const { data, errors } = await res.json();
            if (errors) {
                console.log(errors)
                return null;
            }

            if (data?.webPixelCreate?.userErrors?.[0]?.message) {
                console.log(data.webPixelCreate.userErrors[0].message)
                return null;
            }

            return data?.webPixelCreate?.webPixel?.id;
        } catch (error) {
            console.log(error);
        }
    },
};