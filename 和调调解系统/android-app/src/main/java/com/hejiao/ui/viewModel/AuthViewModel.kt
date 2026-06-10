package com.hejiao.ui.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hejiao.data.api.ApiService
import com.hejiao.data.api.dto.LoginRequest
import com.hejiao.data.prefs.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    data class LoginUiState(
        val username: String = "",
        val password: String = "",
        val loading: Boolean = false,
        val error: String? = null,
        val success: Boolean = false
    )

    fun onUsernameChange(value: String) {
        _uiState.update { it.copy(username = value, error = null) }
    }

    fun onPasswordChange(value: String) {
        _uiState.update { it.copy(password = value, error = null) }
    }

    fun login() {
        viewModelScope.launch {
            val state = _uiState.value
            if (state.username.isBlank()) {
                _uiState.update { it.copy(error = "请输入账号") }
                return@launch
            }
            if (state.password.isBlank()) {
                _uiState.update { it.copy(error = "请输入密码") }
                return@launch
            }

            _uiState.update { it.copy(loading = true, error = null) }

            try {
                val response = apiService.login(LoginRequest(state.username, state.password))
                if (response.success && response.data != null) {
                    tokenManager.saveToken(response.data.token!!)
                    _uiState.update { it.copy(loading = false, success = true) }
                } else {
                    _uiState.update { it.copy(loading = false, error = response.error ?: response.message ?: "登录失败") }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(loading = false, error = "网络错误: ${e.message}") }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
