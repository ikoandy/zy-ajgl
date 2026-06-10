package com.hejiao.ui.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hejiao.data.api.ApiService
import com.hejiao.data.api.model.Case
import com.hejiao.data.api.model.CaseListResponse
import com.hejiao.data.api.model.DashboardStats
import com.hejiao.data.api.model.Schedule
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    data class HomeUiState(
        val loading: Boolean = false,
        val stats: DashboardStats? = null,
        val recentCases: List<Case> = emptyList(),
        val todaySchedules: List<Schedule> = emptyList(),
        val error: String? = null
    )

    init {
        loadHomeData()
    }

    fun loadHomeData() {
        viewModelScope.launch {
            _uiState.update { it.copy(loading = true, error = null) }

            try {
                val statsDeferred = kotlinx.coroutines.async { apiService.getCaseStats() }
                val casesDeferred = kotlinx.coroutines.async { apiService.getCases(page = 1, pageSize = 5) }
                val schedulesDeferred = kotlinx.coroutines.async { apiService.getTodaySchedules() }

                val statsResponse = statsDeferred.await()
                val casesResponse = casesDeferred.await()
                val schedulesResponse = schedulesDeferred.await()

                _uiState.update {
                    it.copy(
                        loading = false,
                        stats = if (statsResponse.success) statsResponse.data else null,
                        recentCases = if (casesResponse.success) casesResponse.data?.data ?: emptyList() else emptyList(),
                        todaySchedules = if (schedulesResponse.success) schedulesResponse.data ?: emptyList() else emptyList()
                    )
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(loading = false, error = "加载数据失败: ${e.message}") }
            }
        }
    }

    fun refresh() {
        loadHomeData()
    }
}
