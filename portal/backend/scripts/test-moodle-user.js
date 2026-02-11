#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from "../src/utils/logger.js";

// Load the backend .env explicitly so MOODLE_* vars are available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function makeTestUser() {
  const now = Date.now();
  const username = `itfy_test_${now}`;
  const email = `itfy_test_${now}@itfy.test`;
  const password = process.env.MOODLE_TEST_PASSWORD || "Password123!";
  return {
    username,
    password,
    firstname: "Test",
    lastname: "Moodle",
    email,
  };
}

async function run() {
  try {
    // Import Moodle service after env is loaded
    const { default: moodleService } = await import("../src/integrations/moodle/moodle.service.js");

    const user = makeTestUser();
    logger.info("Creating Moodle user", { email: user.email, username: user.username });

    const created = await moodleService.getAllMoodleUsers();

    // logger.info("Moodle user created", { id: created.id, username: created.username });
    console.log(JSON.stringify(created, null, 2));
    process.exit(0);
  } catch (error) {
    logger.error("Failed to create Moodle user", { error: error.message });
    console.error(error);
    process.exit(1);
  }
}

run();
