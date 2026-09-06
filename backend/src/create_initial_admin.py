import asyncio
import os
import socket

from sqlalchemy.exc import SQLAlchemyError

from database import UserModel, UserRoleEnum
from database.session_postgresql import AsyncPostgresqlSessionLocal
from repositories.users import UserRepository


async def create_initial_admin() -> None:
    email = os.getenv("INITIAL_ADMIN_EMAIL")
    password = os.getenv("INITIAL_ADMIN_PASSWORD")

    if not email:
        raise RuntimeError("INITIAL_ADMIN_EMAIL is not set.")

    if not password:
        raise RuntimeError("INITIAL_ADMIN_PASSWORD is not set.")

    normalized_email = email.strip().lower()

    async with AsyncPostgresqlSessionLocal() as session:
        users = UserRepository(session)

        existing_superadmins = await users.count_users_with_role(
            UserRoleEnum.SUPERADMIN
        )

        if existing_superadmins:
            print("Superadmin already exists. Skipping.")
            return

        existing_user = await users.get_by_email(normalized_email)

        if existing_user:
            existing_user.role = UserRoleEnum.SUPERADMIN
            existing_user.is_active = True
            existing_user.password = password
        else:
            superadmin = UserModel.create(
                email=normalized_email,
                raw_password=password,
                first_name="Initial",
                last_name="Superadmin",
                role=UserRoleEnum.SUPERADMIN,
                source="admin_created",
            )
            superadmin.is_active = True
            users.add_user(superadmin)

        await session.commit()

    print("Initial superadmin user is ready.")


def main() -> None:
    try:
        asyncio.run(create_initial_admin())
    except (SQLAlchemyError, socket.gaierror) as error:
        raise RuntimeError("Database connection failed.") from error


if __name__ == "__main__":
    main()
