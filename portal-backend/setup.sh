#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$ROOT_DIR/backend"

# Feature modules
mkdir -p \
  "$ROOT_DIR/backend/src/modules/user" \
  "$ROOT_DIR/backend/src/modules/course" \
  "$ROOT_DIR/backend/src/modules/enrollment" \
  "$ROOT_DIR/backend/src/modules/payment/webhooks" \
  "$ROOT_DIR/backend/src/modules/shared/auth" \
  "$ROOT_DIR/backend/src/modules/shared/email" \
  "$ROOT_DIR/backend/src/modules/shared/sso" \
  "$ROOT_DIR/backend/src/modules/shared/notification"

# Integrations
mkdir -p \
  "$ROOT_DIR/backend/src/integrations/moodle" \
  "$ROOT_DIR/backend/src/integrations/paystack" \
  "$ROOT_DIR/backend/src/integrations/incubator"

# Global middlewares, config, database, repos, services, routes, utils, validators
mkdir -p \
  "$ROOT_DIR/backend/src/middlewares" \
  "$ROOT_DIR/backend/src/config" \
  "$ROOT_DIR/backend/src/database/migrations" \
  "$ROOT_DIR/backend/src/database/seeds" \
  "$ROOT_DIR/backend/src/repositories" \
  "$ROOT_DIR/backend/src/services" \
  "$ROOT_DIR/backend/src/routes" \
  "$ROOT_DIR/backend/src/utils" \
  "$ROOT_DIR/backend/src/validators"

# Bot
mkdir -p \
  "$ROOT_DIR/backend/bot/commands" \
  "$ROOT_DIR/backend/bot/handlers"

# Tests
mkdir -p \
  "$ROOT_DIR/backend/tests/modules/user" \
  "$ROOT_DIR/backend/tests/modules/course" \
  "$ROOT_DIR/backend/tests/modules/enrollment" \
  "$ROOT_DIR/backend/tests/integration"

# Files (touch if missing)
files=(
  "$ROOT_DIR/backend/src/modules/user/user.controller.js"
  "$ROOT_DIR/backend/src/modules/user/user.service.js"
  "$ROOT_DIR/backend/src/modules/user/user.repository.js"
  "$ROOT_DIR/backend/src/modules/user/user.model.js"
  "$ROOT_DIR/backend/src/modules/user/user.routes.js"
  "$ROOT_DIR/backend/src/modules/user/user.validator.js"
  "$ROOT_DIR/backend/src/modules/user/index.js"

  "$ROOT_DIR/backend/src/modules/course/course.controller.js"
  "$ROOT_DIR/backend/src/modules/course/course.service.js"
  "$ROOT_DIR/backend/src/modules/course/course.repository.js"
  "$ROOT_DIR/backend/src/modules/course/course.model.js"
  "$ROOT_DIR/backend/src/modules/course/course.routes.js"
  "$ROOT_DIR/backend/src/modules/course/course.validator.js"
  "$ROOT_DIR/backend/src/modules/course/index.js"

  "$ROOT_DIR/backend/src/modules/enrollment/enrollment.controller.js"
  "$ROOT_DIR/backend/src/modules/enrollment/enrollment.service.js"
  "$ROOT_DIR/backend/src/modules/enrollment/enrollment.repository.js"
  "$ROOT_DIR/backend/src/modules/enrollment/enrollment.model.js"
  "$ROOT_DIR/backend/src/modules/enrollment/enrollment.routes.js"
  "$ROOT_DIR/backend/src/modules/enrollment/enrollment.validator.js"
  "$ROOT_DIR/backend/src/modules/enrollment/index.js"

  "$ROOT_DIR/backend/src/modules/payment/payment.controller.js"
  "$ROOT_DIR/backend/src/modules/payment/payment.service.js"
  "$ROOT_DIR/backend/src/modules/payment/payment.repository.js"
  "$ROOT_DIR/backend/src/modules/payment/payment.model.js"
  "$ROOT_DIR/backend/src/modules/payment/payment.routes.js"
  "$ROOT_DIR/backend/src/modules/payment/payment.validator.js"
  "$ROOT_DIR/backend/src/modules/payment/webhooks/paystack.webhook.js"
  "$ROOT_DIR/backend/src/modules/payment/index.js"

  "$ROOT_DIR/backend/src/modules/shared/auth/auth.controller.js"
  "$ROOT_DIR/backend/src/modules/shared/auth/auth.service.js"
  "$ROOT_DIR/backend/src/modules/shared/auth/auth.middleware.js"
  "$ROOT_DIR/backend/src/modules/shared/auth/jwt.util.js"
  "$ROOT_DIR/backend/src/modules/shared/auth/index.js"

  "$ROOT_DIR/backend/src/modules/shared/email/email.service.js"
  "$ROOT_DIR/backend/src/modules/shared/email/email.client.js"
  "$ROOT_DIR/backend/src/modules/shared/email/templates.js"
  "$ROOT_DIR/backend/src/modules/shared/email/index.js"

  "$ROOT_DIR/backend/src/modules/shared/sso/sso.controller.js"
  "$ROOT_DIR/backend/src/modules/shared/sso/sso.service.js"
  "$ROOT_DIR/backend/src/modules/shared/sso/sso.routes.js"
  "$ROOT_DIR/backend/src/modules/shared/sso/index.js"

  "$ROOT_DIR/backend/src/modules/shared/notification/notification.service.js"
  "$ROOT_DIR/backend/src/modules/shared/notification/notification.repository.js"
  "$ROOT_DIR/backend/src/modules/shared/notification/index.js"

  "$ROOT_DIR/backend/src/integrations/moodle/moodle.client.js"
  "$ROOT_DIR/backend/src/integrations/moodle/moodle.service.js"
  "$ROOT_DIR/backend/src/integrations/moodle/index.js"

  "$ROOT_DIR/backend/src/integrations/paystack/paystack.client.js"
  "$ROOT_DIR/backend/src/integrations/paystack/paystack.service.js"
  "$ROOT_DIR/backend/src/integrations/paystack/index.js"

  "$ROOT_DIR/backend/src/integrations/incubator/incubator.client.js"
  "$ROOT_DIR/backend/src/integrations/incubator/incubator.service.js"
  "$ROOT_DIR/backend/src/integrations/incubator/index.js"

  "$ROOT_DIR/backend/src/middlewares/error.middleware.js"
  "$ROOT_DIR/backend/src/middlewares/logger.middleware.js"
  "$ROOT_DIR/backend/src/middlewares/cors.middleware.js"
  "$ROOT_DIR/backend/src/middlewares/rateLimit.middleware.js"

  "$ROOT_DIR/backend/src/config/index.js"
  "$ROOT_DIR/backend/src/config/database.js"
  "$ROOT_DIR/backend/src/config/redis.js"

  "$ROOT_DIR/backend/src/database/client.js"

  "$ROOT_DIR/backend/src/repositories/base.repository.js"

  "$ROOT_DIR/backend/src/services/sync.service.js"

  "$ROOT_DIR/backend/src/routes/index.js"

  "$ROOT_DIR/backend/src/utils/logger.js"
  "$ROOT_DIR/backend/src/utils/errors.js"
  "$ROOT_DIR/backend/src/utils/response.js"
  "$ROOT_DIR/backend/src/utils/asyncHandler.js"

  "$ROOT_DIR/backend/src/validators/common.validator.js"

  "$ROOT_DIR/backend/src/app.js"
  "$ROOT_DIR/backend/src/server.js"

  "$ROOT_DIR/backend/bot/bot.js"

  "$ROOT_DIR/backend/.env"
  "$ROOT_DIR/backend/.env.example"
  "$ROOT_DIR/backend/package.json"
  "$ROOT_DIR/backend/README.md"
)

for file in "${files[@]}"; do
  if [[ ! -e "$file" ]]; then
    touch "$file"
  fi
done

echo "Setup complete."
