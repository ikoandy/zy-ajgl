package com.hejiao.ui.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hejiao.data.api.ApiService
import com.hejiao.data.api.dto.FeedbackRequest
import com.hejiao.data.api.model.Case
import com.hejiao.data.api.model.CaseParty
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FeedbackViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    val ratingTexts = mapOf(
        1 to "非常不满意",
        2 to "不满意",
        3 to "一般",
        4 to "满意",
        5 to "非常满意"
    )

    private val _uiState = MutableStateFlow(FeedbackUiState())
    val uiState: StateFlow<FeedbackUiState> = _uiState.asStateFlow()

    data class FeedbackUiState(
        val selectedCase: Case? = null,
        val selectedPartyId: Int? = null,
        val selectedPartyName: String = "",
        val parties: List<CaseParty> = emptyList(),
        val rating: Int = 0,
        val attitude: Int = 0,
        val efficiency: Int = 0,
        val fairness: Int = 0,
        val comment: String = "",
        val isAnonymous: Boolean = false,
        val submitting: Boolean = false,
        val submitSuccess: Boolean = false,
        val error: String? = null
    )

    fun selectCase(case: Case) {
        _uiState.update {
            it.copy(
                selectedCase = case,
                selectedPartyId = null,
                selectedPartyName = "",
                parties = emptyList(),
                rating = 0,
                attitude = 0,
                efficiency = 0,
                fairness = 0,
                comment = "",
                error = null
            )
        }
        loadParties(case.id)
    }

    fun loadParties(caseId: Int) {
        viewModelScope.launch {
            try {
                val response = apiService.getCaseParties(caseId)
                _uiState.update {
                    it.copy(
                        parties = if (response.success && response.data != null) response.data else emptyList()
                    )
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = "加载当事人失败: ${e.message}") }
            }
        }
    }

    fun selectParty(id: Int, name: String) {
        _uiState.update { it.copy(selectedPartyId = id, selectedPartyName = name) }
    }

    fun setRating(r: Int) {
        _uiState.update { it.copy(rating = r.coerceIn(1, 5)) }
    }

    fun setSubRating(field: String, value: Int) {
        _uiState.update { state ->
            when (field) {
                "attitude" -> state.copy(attitude = value.coerceIn(1, 5))
                "efficiency" -> state.copy(efficiency = value.coerceIn(1, 5))
                "fairness" -> state.copy(fairness = value.coerceIn(1, 5))
                else -> state
            }
        }
    }

    fun onCommentChange(text: String) {
        _uiState.update { it.copy(comment = text.take(500)) }
    }

    fun toggleAnonymous() {
        _uiState.update { it.copy(isAnonymous = !it.isAnonymous) }
    }

    fun submit() {
        val state = _uiState.value
        if (state.selectedCase == null) {
            _uiState.update { it.copy(error = "请先选择案件") }
            return
        }
        if (state.selectedPartyId == null) {
            _uiState.update { it.copy(error = "请先选择当事人") }
            return
        }
        if (state.rating == 0) {
            _uiState.update { it.copy(error = "请进行总体评分") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(submitting = true, error = null) }
            try {
                val request = FeedbackRequest(
                    caseId = state.selectedCase!!.id,
                    partyId = state.selectedPartyId!!,
                    rating = state.rating,
                    attitudeScore = state.attitude.takeIf { it > 0 },
                    efficiencyScore = state.efficiency.takeIf { it > 0 },
                    fairnessScore = state.fairness.takeIf { it > 0 },
                    comment = state.comment.takeIf { it.isNotBlank() },
                    isAnonymous = state.isAnonymous
                )
                val response = apiService.submitFeedback(request)
                if (response.success) {
                    _uiState.update {
                        FeedbackUiState(submitSuccess = true)
                    }
                } else {
                    _uiState.update {
                        it.copy(
                            submitting = false,
                            error = response.message ?: "提交失败"
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        submitting = false,
                        error = "网络错误: ${e.message}"
                    )
                }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }

    fun resetForm() {
        _uiState.update { FeedbackUiState() }
    }
}
