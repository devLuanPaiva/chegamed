package com.devluanpaiva.controle_de_remedios.modules.user.enums;

import java.util.Set;

public enum UserRole {

	ADMIN,

	MANAGER,

	ASSISTANT,

	PATIENT,

	DELIVERER;

	public Set<UserRole> manageableRoles() {
		return switch (this) {
			case ADMIN -> Set.of(MANAGER, ASSISTANT, PATIENT, DELIVERER);
			case MANAGER -> Set.of(ASSISTANT, PATIENT, DELIVERER);
			case ASSISTANT -> Set.of();
			case PATIENT -> Set.of();
			case DELIVERER -> Set.of();
		};
	}

	public boolean canManage(UserRole targetRole) {
		return manageableRoles().contains(targetRole);
	}
}
