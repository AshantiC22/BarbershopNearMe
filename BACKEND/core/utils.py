from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """Custom DRF exception handler — wraps all errors in a consistent format."""
    response = exception_handler(exc, context)

    if response is not None:
        # Normalise to { detail: "..." } format
        if isinstance(response.data, dict) and 'detail' not in response.data:
            errors = []
            for key, val in response.data.items():
                if isinstance(val, list):
                    errors.append(f"{key}: {val[0]}")
                else:
                    errors.append(str(val))
            response.data = {'detail': ' | '.join(errors)}
        return response

    # Unhandled exception — log it and return 500
    logger.error(f"Unhandled exception in {context.get('view')}: {exc}", exc_info=True)
    return Response(
        {'detail': 'An unexpected server error occurred.'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
