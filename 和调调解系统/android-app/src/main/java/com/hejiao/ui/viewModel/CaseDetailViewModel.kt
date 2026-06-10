package com.hejiao.ui.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hejiao.data.api.ApiService
import com.hejiao.data.api.dto.TransitionRequest
import com.hejiao.data.api.model.Case
import com.hejiao.data.api.model.CaseParty
import com.hejiao.data.api.model.WorkflowLog
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CaseDetailViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(CaseDetailUiState())
    val uiState: StateFlow<CaseDetailUiState> = _uiState.asStateFlow()

    data class CaseDetailUiState(
        val caseData: Case? = null,
        val parties: List<CaseParty> = emptyList(),
        val timeline: List<WorkflowLog> = emptyList(),
        val loading: Boolean = false,
        val transitioning: Boolean = false,
        val error: String? = null,
        val successMessage: String? = null
    )

    val transitionOptions = listOf(
        "accepted" to "受理案件",
        "mediating" to "开始调解",
        "agreed" to "达成协议",
        "terminated" to "终止案件",
        "closed" to "结案"
    )

    val priorityMap = mapOf(
        "urgent" to "紧急",
        "high" to "较高",
        "normal" to "普通",
        "low" to "较低"
    )

    val roleMap = mapOf(
        "plaintiff" to "申请人",
        "defendant" to "被申请人",
        "witness" to "证人"
    )

    fun loadDetail(caseId: Int) {
        viewModelScope.launch {
            _uiState.update { it.copy(loading = true, error = null) }

            try {
                val caseDeferred = async { apiService.getCaseDetail(caseId) }
                val partiesDeferred = async { apiService.getCaseParties(caseId) }
                val timelineDeferred = async { apiService.getWorkflowTimeline(caseId) }

                val caseResponse = caseDeferred.await()
                val partiesResponse = partiesDeferred.await()
                val timelineResponse = timelineDeferred.await()

                _uiState.update {
                    it.copy(
                        loading = false,
                        caseData = if (caseResponse.success) caseResponse.data else null,
                        parties = if (partiesResponse.success && partiesResponse.data != null) partiesResponse.data else emptyList(),
                        timeline = if (timelineResponse.success && timelineResponse.data != null) timelineResponse.data else emptyList(),
                        error = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(loading = false, error = "加载失败: ${e.message}")
                }
            }
        }
    }

    fun transition(caseId: Int, toStatus: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(transitioning = true, error = null, successMessage = null) }

            try {
                val response = apiService.transitionStatus(
                    caseId = caseId,
                    request = TransitionRequest(status = toStatus)
                )

                if (response.success) {
                    _uiState.update {
                        it.copy(
                            transitioning = false,
                            successMessage = "状态流转成功"
                        )
                    }
                    loadDetail(caseId)
                } else {
                    _uiState.update {
                        it.copy(transitioning = false, error = response.message ?: "状态流转失败")
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(transitioning = false, error = "网络错误: ${e.message}")
                }
            }
        }
    }

    fun clearMessages() {
        _uiState.update { it.copy(error = null, successMessage = null) }
    }
}
