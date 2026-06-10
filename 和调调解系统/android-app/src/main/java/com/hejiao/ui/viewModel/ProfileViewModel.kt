package com.hejiao.ui.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hejiao.data.api.ApiService
import com.hejiao.data.api.model.User
import com.hejiao.data.prefs.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    data class ProfileUiState(
        val userInfo: User? = null,
        val nameInitial: String = "",
        val roleDisplay: String = "",
        val stats: Map<String, Int> = emptyMap(),
        val loading: Boolean = false
    )

    companion object {
        val roleDisplayMap = mapOf(
            "super_admin" to "超级管理员",
            "org_admin" to "机构管理员",
            "senior_mediator" to "高级调解员",
            "mediator" to "调解员",
            "staff" to "工作人员"
        )
    }

    init {
        loadUserInfo()
    }

    fun loadUserInfo() {
        viewModelScope.launch {
            _uiState.update { it.copy(loading = true) }
            try {
                val response = apiService.getCurrentUser()
                if (response.success && response.data != null) {
                    val user = response.data
                    val displayName = user.real_name ?: user.username ?: "用户"
                    _uiState.update {
                        it.copy(
                            userInfo = user,
                            nameInitial = if (displayName.isNotEmpty()) displayName.first().toString() else "?",
                            roleDisplay = roleDisplayMap[user.roleDisplayName ?: ""] ?: user.roleDisplayName ?: "用户",
                            stats = mapOf(
                                "cases" to (user.id ?: 0),
                                "schedules" to 0,
                                "videos" to 0
                            ),
                            loading = false
                        )
                    }
                } else {
                    _uiState.update { it.copy(loading = false) }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(loading = false) }
            }
        }
    }

    fun doLogout(onLogoutComplete: () -> Unit) {
        viewModelScope.launch {
            try {
                apiService.logout()
            } catch (_: Exception) {
            }
            tokenManager.clearToken()
            onLogoutComplete()
        }
    }
}
