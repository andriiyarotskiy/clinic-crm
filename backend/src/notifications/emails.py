import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib
import httpx
from jinja2 import Environment, FileSystemLoader, select_autoescape

from exceptions import BaseEmailError
from notifications.interfaces import EmailSenderInterface


class EmailSender(EmailSenderInterface):
    """SMTP email sender (async) — intended for local MailHog or any SMTP.

    Parameters mirror common env vars: hostname, port, email (username),
    email_from (from address), password, use_tls, and template directory.
    """

    def __init__(
        self,
        hostname: str,
        port: int,
        email: str,
        email_from: str,
        password: str,
        use_tls: bool,
        template_dir: str,
        activation_email_template_name: str,
        activation_complete_email_template_name: str,
        password_email_template_name: str,
        password_complete_email_template_name: str,
    ):
        self._hostname = hostname
        self._port = port
        self._email = email
        self._email_from = email_from
        self._password = password
        self._use_tls = use_tls
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

    async def _send_email(self, recipient: str, subject: str, html_content: str) -> None:
        message = MIMEMultipart()
        message["From"] = self._email_from
        message["To"] = recipient
        message["Subject"] = subject
        message.attach(MIMEText(html_content, "html"))

        try:
            smtp = aiosmtplib.SMTP(hostname=self._hostname, port=self._port, start_tls=self._use_tls)
            await smtp.connect()
            if self._password:
                await smtp.login(self._email, self._password)
            await smtp.sendmail(self._email_from, [recipient], message.as_string())
            await smtp.quit()
        except aiosmtplib.SMTPException as error:
            logging.exception("Failed to send email to %s", recipient)
            raise BaseEmailError(f"Failed to send email to {recipient}: {error}") from error

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


class BrevoEmailSender(EmailSenderInterface):
    API_URL = "https://api.brevo.com/v3/smtp/email"

    def __init__(
        self,
        api_key: str,
        email_from: str,
        template_dir: str,
        activation_email_template_name: str,
        activation_complete_email_template_name: str,
        password_email_template_name: str,
        password_complete_email_template_name: str,
    ):
        self._api_key = api_key
        self._email_from = email_from
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
        self,
        recipient: str,
        subject: str,
        html_content: str,
    ) -> None:
        headers = {
            "accept": "application/json",
            "api-key": self._api_key,
            "content-type": "application/json",
        }

        payload = {
            "sender": {
                "email": self._email_from,
            },
            "to": [
                {
                    "email": recipient,
                }
            ],
            "subject": subject,
            "htmlContent": html_content,
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.API_URL,
                    headers=headers,
                    json=payload,
                    timeout=10.0,
                )

                response.raise_for_status()

        except httpx.HTTPError as error:
            logging.exception(
                "Failed to send Brevo email to %s",
                recipient,
            )
            raise BaseEmailError(
                f"Failed to send email to {recipient}: {error}"
            ) from error

    async def send_activation_email(
        self,
        email: str,
        activation_link: str,
    ) -> None:
        template = self._env.get_template(
            self._activation_email_template_name
        )
        html_content = template.render(
            email=email,
            activation_link=activation_link,
        )

        await self._send_email(
            email,
            "Clinic CRM account activation",
            html_content,
        )

    async def send_activation_complete_email(
        self,
        email: str,
        login_link: str,
    ) -> None:
        template = self._env.get_template(
            self._activation_complete_email_template_name
        )
        html_content = template.render(
            email=email,
            login_link=login_link,
        )

        await self._send_email(
            email,
            "Clinic CRM account activated",
            html_content,
        )

    async def send_password_reset_email(
        self,
        email: str,
        reset_link: str,
    ) -> None:
        template = self._env.get_template(
            self._password_email_template_name
        )
        html_content = template.render(
            email=email,
            reset_link=reset_link,
        )

        await self._send_email(
            email,
            "Clinic CRM password reset",
            html_content,
        )

    async def send_password_reset_complete_email(
        self,
        email: str,
        login_link: str,
    ) -> None:
        template = self._env.get_template(
            self._password_complete_email_template_name
        )
        html_content = template.render(
            email=email,
            login_link=login_link,
        )

        await self._send_email(
            email,
            "Clinic CRM password changed",
            html_content,
        )
