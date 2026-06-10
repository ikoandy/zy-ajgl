package com.hejiao.ui.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hejiao.data.api.ApiService
import com.hejiao.data.api.model.Case
import com.hejiao.ui.component.FilterItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CaseListViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(CaseListUiState())
    val uiState: StateFlow<CaseListUiState> = _uiState.asStateFlow()

    data class CaseListUiState(
        val keyword: String = "",
        val activeStatus: String = "",
        val cases: List<Case> = emptyList(),
        val loading: Boolean = false,
        val hasMore: Boolean = true,
        val page: Int = 1,
        val error: String? = null
    )

    val statusFilters = listOf(
        FilterItem("", "全部"),
        FilterItem("pending", "待受理"),
        FilterItem("accepted", "已受理"),
        FilterItem("mediating", "调解中"),
        FilterItem("agreed", "已协议"),
        FilterItem("closed", "已结案")
    )

    init {
        loadCases(reset = true)
    }

    fun loadCases(reset: Boolean = false) {
        if (_uiState.value.loading) return

        viewModelScope.launch {
            val currentState = _uiState.value
            val page = if (reset) 1 else currentState.page

            _uiState.update {
                it.copy(
                    loading = true,
                    error = null,
                    page = page
                )
            }

            try {
                val response = apiService.getCases(
                    page = page,
                    pageSize = 15,
                    status = currentState.activeStatus.ifEmpty { null },
                    keyword = currentState.keyword.ifEmpty { null }
                )

                if (response.success && response.data != null) {
                    val newCases = response.data.data ?: emptyList()
                    val totalLoaded = if (reset) newCases.size else currentState.cases.size + newCases.size
                    val total = response.data.total

                    _uiState.update {
                        it.copy(
                            loading = false,
                            cases = if (reset) newCases else currentState.cases + newCases,
                            hasMore = totalLoaded < total,
                            page = page + 1,
                            error = null
                        )
                    }
                } else {
                    _uiState.update {
                        it.copy(loading = false, error = response.message ?: "加载失败")
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(loading = false, error = "网络错误: ${e.message}")
                }
            }
        }
    }

    fun onSearch(keyword: String) {
        _uiState.update { it.copy(keyword = keyword) }
        loadCases(reset = true)
    }

    fun filterByStatus(status: String) {
        _uiState.update { it.copy(activeStatus = status) }
        loadCases(reset = true)
    }

    fun loadMore() {
        if (_uiState.value.hasMore && !_uiState.value.loading) {
            loadCases()
        }
    }
}
