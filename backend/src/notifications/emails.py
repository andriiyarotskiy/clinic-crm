import logging

import httpx
from jinja2 import Environment, FileSystemLoader, select_autoescape

from exceptions import BaseEmailError
from notifications.interfaces import EmailSenderInterface

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


class EmailSender(EmailSenderInterface):
    def __init__(
        self,
        api_key: str,
        email_from: str,
        sender_name: str,
        template_dir: str,
        activation_email_template_name: str,
        activation_complete_email_template_name: str,
        password_email_template_name: str,
        password_complete_email_template_name: str,
    ):
        self._api_key = api_key
        self._email_from = email_from
        self._sender_name = sender_name
        self._activation_email_template_name = activation_email_template_name
        self._activation_complete_email_template_name = (
            activation_complete_email_template_name
        )
        self._password_email_template_name = password_email_template_name
        self._password_complete_email_template_name = (
            password_complete_email_template_name
        )
        self._env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=select_autoescape(["html", "xml"]),
        )

    async def _send_email(
        self, recipient: str, subject: str, html_content: str
    ) -> None:
        payload = {
            "sender": {"name": self._sender_name, "email": self._email_from},
            "to": [{"email": recipient}],
            "subject": subject,
            "htmlContent": html_content,
        }
        headers = {
            "accept": "application/json",
            "api-key": self._api_key,
            "content-type": "application/json",
        }
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(
                    BREVO_API_URL, json=payload, headers=headers
                )
                response.raise_for_status()
        except httpx.HTTPError as error:
            logging.exception("Failed to send email to %s", recipient)
            raise BaseEmailError(
                f"Failed to send email to {recipient}: {error}"
            ) from error

    async def send_activation_email(self, email: str, activation_link: str) -> None:
        template = self._env.get_template(self._activation_email_template_name)
        html_content = template.render(email=email, activation_link=activation_link)
        await self._send_email(email, "Clinic CRM account activation", html_content)

    async def send_activation_complete_email(self, email: str, login_link: str) -> None:
        template = self._env.get_template(self._activation_complete_email_template_name)
        html_content = template.render(email=email, login_link=login_link)
        await self._send_email(email, "Clinic CRM account activated", html_content)

    async def send_password_reset_email(self, email: str, reset_link: str) -> None:
        template = self._env.get_template(self._password_email_template_name)
        html_content = template.render(email=email, reset_link=reset_link)
        await self._send_email(email, "Clinic CRM password reset", html_content)

    async def send_password_reset_complete_email(
        self, email: str, login_link: str
    ) -> None:
        template = self._env.get_template(self._password_complete_email_template_name)
        html_content = template.render(email=email, login_link=login_link)
        await self._send_email(email, "Clinic CRM password changed", html_content)