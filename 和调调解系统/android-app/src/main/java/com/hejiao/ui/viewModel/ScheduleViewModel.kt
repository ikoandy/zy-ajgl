package com.hejiao.ui.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hejiao.data.api.ApiService
import com.hejiao.data.api.dto.CreateScheduleRequest
import com.hejiao.data.api.model.Schedule
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import javax.inject.Inject

data class ScheduleForm(
    val title: String = "",
    val startTime: String = "09:00",
    val endTime: String = "10:00",
    val location: String = "",
    val date: String = ""
)

data class ScheduleUiState(
    val groupedSchedules: Map<String, List<Schedule>> = emptyMap(),
    val dateRange: String = "",
    val weekStart: String = "",
    val refreshing: Boolean = false,
    val loading: Boolean = true,
    val showAddModal: Boolean = false,
    val submitting: Boolean = false,
    val form: ScheduleForm = ScheduleForm()
)

@HiltViewModel
class ScheduleViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    companion object {
        val statusMap = mapOf(
            "pending" to "待开始",
            "ongoing" to "进行中",
            "completed" to "已完成",
            "cancelled" to "已取消"
        )
        val weekdays = arrayOf("周日", "周一", "周二", "周三", "周四", "周五", "周六")
        private const val DATE_FORMAT = "yyyy-MM-dd"
        private const val DISPLAY_FORMAT = "MM月dd日"
    }

    private val _uiState = MutableStateFlow(ScheduleUiState())
    val uiState: StateFlow<ScheduleUiState> = _uiState.asStateFlow()

    init {
        setWeekRange(Calendar.getInstance())
    }

    fun setWeekRange(calendar: Calendar) {
        val cal = calendar.clone() as Calendar
        cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)
        val monday = cal.time
        cal.add(Calendar.DAY_OF_YEAR, 6)
        val sunday = cal.time

        val sdf = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())
        val displaySdf = SimpleDateFormat(DISPLAY_FORMAT, Locale.getDefault())

        val startStr = sdf.format(monday)
        val endStr = sdf.format(sunday)

        val rangeText = "${displaySdf.format(monday)} - ${displaySdf.format(sunday)}"

        _uiState.update {
            it.copy(
                dateRange = rangeText,
                weekStart = startStr,
                form = it.form.copy(date = sdf.format(Calendar.getInstance().time))
            )
        }

        loadSchedules(startStr, endStr)
    }

    fun loadSchedules(startDate: String? = null, endDate: String? = null) {
        viewModelScope.launch {
            _uiState.update { it.copy(loading = true, refreshing = startDate != null) }

            try {
                val response = if (startDate != null && endDate != null) {
                    apiService.getCalendarSchedules(startDate, endDate)
                } else {
                    apiService.getSchedules()
                }

                if (response.success && response.data != null) {
                    val grouped = groupByDate(response.data)
                    _uiState.update { it.copy(groupedSchedules = grouped, loading = false, refreshing = false) }
                } else {
                    _uiState.update { it.copy(groupedSchedules = emptyMap(), loading = false, refreshing = false) }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(loading = false, refreshing = false) }
            }
        }
    }

    fun prevWeek() {
        val cal = Calendar.getInstance()
        val sdf = SimpleDateFormat(ScheduleViewModel.DATE_FORMAT, Locale.getDefault())
        val currentStart = _uiState.value.weekStart
        if (currentStart.isNotEmpty()) {
            cal.time = sdf.parse(currentStart) ?: return
        }
        cal.add(Calendar.DAY_OF_YEAR, -7)
        setWeekRange(cal)
    }

    fun nextWeek() {
        val cal = Calendar.getInstance()
        val sdf = SimpleDateFormat(ScheduleViewModel.DATE_FORMAT, Locale.getDefault())
        val currentStart = _uiState.value.weekStart
        if (currentStart.isNotEmpty()) {
            cal.time = sdf.parse(currentStart) ?: return
        }
        cal.add(Calendar.DAY_OF_YEAR, 7)
        setWeekRange(cal)
    }

    fun goToday() {
        setWeekRange(Calendar.getInstance())
    }

    fun showAdd() {
        _uiState.update {
            it.copy(
                showAddModal = true,
                form = it.form.copy(
                    date = SimpleDateFormat(ScheduleViewModel.DATE_FORMAT, Locale.getDefault()).format(Calendar.getInstance().time),
                    startTime = "09:00",
                    endTime = "10:00",
                    title = "",
                    location = ""
                )
            )
        }
    }

    fun hideAdd() {
        _uiState.update { it.copy(showAddModal = false) }
    }

    fun onFormInput(field: String, value: String) {
        _uiState.update {
            val updatedForm = when (field) {
                "title" -> it.form.copy(title = value)
                "startTime" -> it.form.copy(startTime = value)
                "endTime" -> it.form.copy(endTime = value)
                "location" -> it.form.copy(location = value)
                "date" -> it.form.copy(date = value)
                else -> it.form
            }
            it.copy(form = updatedForm)
        }
    }

    fun submitSchedule() {
        val form = _uiState.value.form
        if (form.title.isBlank()) return

        viewModelScope.launch {
            _uiState.update { it.copy(submitting = true) }

            try {
                val request = CreateScheduleRequest(
                    title = form.title.trim(),
                    startTime = "${form.date} ${form.startTime}:00",
                    endTime = "${form.date} ${form.endTime}:00",
                    location = form.location.ifBlank { null },
                    scheduleType = "general"
                )

                apiService.createSchedule(request)

                hideAdd()

                val currentStart = _uiState.value.weekStart
                val currentEnd = run {
                    val cal = Calendar.getInstance()
                    val sdf = SimpleDateFormat(ScheduleViewModel.DATE_FORMAT, Locale.getDefault())
                    cal.time = sdf.parse(currentStart) ?: Calendar.getInstance().time
                    cal.add(Calendar.DAY_OF_YEAR, 6)
                    SimpleDateFormat(ScheduleViewModel.DATE_FORMAT, Locale.getDefault()).format(cal.time)
                }

                loadSchedules(currentStart, currentEnd)
            } catch (e: Exception) {
                // 提交失败，保持弹窗打开以便用户重试
            } finally {
                _uiState.update { it.copy(submitting = false) }
            }
        }
    }

    private fun groupByDate(schedules: List<Schedule>): Map<String, List<Schedule>> {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        return schedules
            .sortedBy { it.startTime }
            .groupBy { schedule ->
                schedule.startTime?.let { time ->
                    try {
                        val date = sdf.parse(time.substring(0, 10))
                        if (date != null) {
                            val calendar = Calendar.getInstance()
                            calendar.time = date
                            val dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK)
                            val displayDate = SimpleDateFormat("MM/dd", Locale.getDefault()).format(date)
                            "$displayDate ${weekdays[dayOfWeek - 1]}"
                        } else {
                            time.substring(0, 10)
                        }
                    } catch (e: Exception) {
                        time.substring(0, 10)
                    }
                } ?: "未知日期"
            }
    }
}
