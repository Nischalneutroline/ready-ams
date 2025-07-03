// src/app/api/microsoft/callback/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const MS_CLIENT_ID = process.env.MS_CLIENT_ID!;
const MS_CLIENT_SECRET = process.env.MS_CLIENT_SECRET!;
const MS_REDIRECT_URI = `${process.env.ORIGIN}/api/microsoft-team/callback`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const individualId = searchParams.get("state"); // Pass this when starting OAuth
  const error = searchParams.get("error");

    if (!individualId) {
  return NextResponse.json({ error: "Missing  individualId" }, { status: 400 });
}


  // Handle errors from Microsoft
  if (error) {
    console.error(`Microsoft OAuth error: ${error}`);
    return new Response(
      `<html>
        <head>
          <title>Authentication Error</title>
          <script>
            window.onload = function() {
              window.opener ? window.opener.postMessage({ error: "${error}" }, "*") : null;
              window.close();
            }
          </script>
        </head>
        <body>
          <p>Authentication failed. You can close this window.</p>
        </body>
      </html>`,
      {
        status: 400,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }

  if (!code) {
    return new Response(
      `<html>
        <head>
          <title>Authentication Error</title>
          <script>
            window.onload = function() {
              window.opener ? window.opener.postMessage({ error: "Missing authorization code" }, "*") : null;
              window.close();
            }
          </script>
        </head>
        <body>
          <p>Authentication failed. Missing authorization code. You can close this window.</p>
        </body>
      </html>`,
      {
        status: 400,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }

  try {
    // Exchange code for tokens
    if (!MS_CLIENT_ID || !MS_CLIENT_SECRET) {
      throw new Error("Microsoft client ID or secret is missing");
    }

    const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: MS_CLIENT_ID,
        client_secret: MS_CLIENT_SECRET,
        redirect_uri: MS_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();
    console.log('Microsoft token data', data);

    if (!data.access_token) {
      return new Response(
        `<html>
          <head>
            <title>Authentication Error</title>
            <script>
              window.onload = function() {
                window.opener ? window.opener.postMessage({ error: "Failed to get access token" }, "*") : null;
                window.close();
              }
            </script>
          </head>
          <body>
            <p>Authentication failed. Failed to get access token. You can close this window.</p>
          </body>
        </html>`,
        {
          status: 500,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    // Calculate token expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));

  
    // Store tokens and expiry in VideoIntegration table
    await prisma.videoIntegration.upsert({
      where: {
        individualId_provider: {
          individualId: individualId,
          provider: "MICROSOFT_TEAMS",
        }
      },
      create: {
        individualId: individualId,
        provider: "MICROSOFT_TEAMS",
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + (data.expires_in * 1000)),
      },
      update: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + (data.expires_in * 1000)),
      }
    });

    // Return HTML that closes the popup and notifies the opener
    return new Response(
      `<html>
        <head>
          <title>Authentication Successful</title>
          <script>
            window.onload = function() {
              window.opener ? window.opener.postMessage({ success: true }, "*") : null;
              window.close();
            }
          </script>
        </head>
        <body>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Error in Microsoft callback:", error);
    
    return new Response(
      `<html>
        <head>
          <title>Authentication Error</title>
          <script>
            window.onload = function() {
              window.opener ? window.opener.postMessage({ error: "Server error" }, "*") : null;
              window.close();
            }
          </script>
        </head>
        <body>
          <p>Authentication failed. An unexpected error occurred. You can close this window.</p>
        </body>
      </html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
}
