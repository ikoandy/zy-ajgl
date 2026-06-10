package com.hejiao.ui.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hejiao.data.api.ApiService
import com.hejiao.data.api.model.VideoSession
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class VideoForm(
    val title: String = "",
    val caseSearch: String = "",
    val date: String = "",
    val time: String = ""
)

data class VideoUiState(
    val sessions: List<VideoSession> = emptyList(),
    val stats: Map<String, Int> = emptyMap(),
    val refreshing: Boolean = false,
    val loading: Boolean = true,
    val showCreate: Boolean = false,
    val submitting: Boolean = false,
    val form: VideoForm = VideoForm()
)

@HiltViewModel
class VideoViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    companion object {
        val statusMap = mapOf(
            "scheduled" to "待开始",
            "in_progress" to "进行中",
            "completed" to "已结束",
            "cancelled" to "已取消"
        )
    }

    private val _uiState = MutableStateFlow(VideoUiState())
    val uiState: StateFlow<VideoUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _uiState.update { it.copy(loading = true, refreshing = false) }

            try {
                val response = apiService.getVideoSessions()
                if (response.success && response.data != null) {
                    val sessions = response.data
                    val stats = mapOf(
                        "total" to sessions.size,
                        "active" to sessions.count { it.status == "scheduled" || it.status == "in_progress" },
                        "completed" to sessions.count { it.status == "completed" }
                    )
                    _uiState.update {
                        it.copy(sessions = sessions, stats = stats, loading = false)
                    }
                } else {
                    _uiState.update {
                        it.copy(sessions = emptyList(), stats = emptyMap(), loading = false)
                    }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(loading = false) }
            }
        }
    }

    fun onRefresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(refreshing = true) }
            loadData()
        }
    }

    fun showCreate() {
        _uiState.update { it.copy(showCreate = true) }
    }

    fun hideCreate() {
        _uiState.update { it.copy(showCreate = false) }
    }

    fun onFormInput(field: String, value: String) {
        _uiState.update {
            val updatedForm = when (field) {
                "title" -> it.form.copy(title = value)
                "caseSearch" -> it.form.copy(caseSearch = value)
                else -> it.form
            }
            it.copy(form = updatedForm)
        }
    }

    fun onDateChange(date: String) {
        _uiState.update { it.copy(form = it.form.copy(date = date)) }
    }

    fun onTimeChange(time: String) {
        _uiState.update { it.copy(form = it.form.copy(time = time)) }
    }

    fun submitVideo() {
        val form = _uiState.value.form
        if (form.title.isBlank()) return

        viewModelScope.launch {
            _uiState.update { it.copy(submitting = true) }

            try {
                val request = mutableMapOf<String, Any?>(
                    "title" to form.title.trim(),
                    "scheduled_at" to "${form.date} ${form.time}:00"
                )
                if (form.caseSearch.isNotBlank()) {
                    request["case_number"] = form.caseSearch.trim()
                }

                apiService.createVideoSession(request)

                hideCreate()
                loadData()
            } catch (e: Exception) {
            } finally {
                _uiState.update { it.copy(submitting = false) }
            }
        }
    }
}
