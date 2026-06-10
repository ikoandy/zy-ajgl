package com.hejiao.ui.screen.schedule

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.BottomSheetScaffold
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SheetValue
import androidx.compose.material3.Text
import androidx.compose.material3.rememberBottomSheetScaffoldState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hejiao.data.api.model.Schedule
import com.hejiao.ui.component.EmptyState
import com.hejiao.ui.component.FullScreenLoading
import com.hejiao.ui.theme.Background
import com.hejiao.ui.theme.BorderLight
import com.hejiao.ui.theme.CardBackground
import com.hejiao.ui.theme.Gold
import com.hejiao.ui.theme.GoldLight
import com.hejiao.ui.theme.Teal
import com.hejiao.ui.theme.TextMuted
import com.hejiao.ui.theme.TextPrimary
import com.hejiao.ui.theme.TextSecondary
import com.hejiao.ui.viewModel.ScheduleViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScheduleScreen(
    viewModel: ScheduleViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val scaffoldState = rememberBottomSheetScaffoldState()
    val scope = rememberCoroutineScope()

    var pullOffsetY by remember { mutableFloatStateOf(0f) }
    val pullProgress by animateFloatAsState(
        targetValue = if (pullOffsetY > 0) (pullOffsetY / 120f).coerceIn(0f, 1f) else 0f,
        label = "pullProgress"
    )

    Box(modifier = Modifier.fillMaxSize().background(Background)) {
        Column(modifier = Modifier.fillMaxSize()) {
            WeekNavigationBar(
                dateRange = uiState.dateRange,
                onPrevWeek = { viewModel.prevWeek() },
                onNextWeek = { viewModel.nextWeek() },
                onGoToday = { viewModel.goToday() }
            )

            Spacer(modifier = Modifier.height(8.dp))

            if (uiState.loading && uiState.groupedSchedules.isEmpty()) {
                FullScreenLoading()
            } else if (uiState.groupedSchedules.isEmpty()) {
                EmptyState(text = "本周暂无日程安排", icon = "📅")
            } else {
                ScheduleListContent(
                    groupedSchedules = uiState.groupedSchedules,
                    refreshing = uiState.refreshing,
                    pullProgress = pullProgress,
                    onPullStart = { offset -> pullOffsetY = offset },
                    onPullEnd = { pullOffsetY = 0f; viewModel.loadSchedules() }
                )
            }
        }

        FloatingActionButton(
            onClick = { scope.launch { scaffoldState.bottomSheetState.expand() }; viewModel.showAdd() },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 20.dp, bottom = 24.dp)
        )

        if (uiState.showAddModal) {
            CreateScheduleBottomSheet(
                form = uiState.form,
                submitting = uiState.submitting,
                onFormChange = { field, value -> viewModel.onFormInput(field, value) },
                onSubmit = { viewModel.submitSchedule() },
                onDismiss = { viewModel.hideAdd(); scope.launch { scaffoldState.bottomSheetState.partialExpand() } }
            )
        }

        if (uiState.refreshing) {
            CircularProgressIndicator(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 80.dp)
                    .size(28.dp),
                color = Gold,
                strokeWidth = 2.5.dp
            )
        }
    }
}

@Composable
private fun WeekNavigationBar(
    dateRange: String,
    onPrevWeek: () -> Unit,
    onNextWeek: () -> Unit,
    onGoToday: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardBackground)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "‹",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = TextSecondary,
            modifier = Modifier
                .clickable(onClick = onPrevWeek)
                .padding(horizontal = 8.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = "上一周",
            fontSize = 13.sp,
            color = TextSecondary,
            modifier = Modifier.clickable(onClick = onPrevWeek).padding(horizontal = 4.dp)
        )

        Spacer(modifier = Modifier.width(16.dp))

        Text(
            text = dateRange.ifEmpty { "加载中..." },
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextPrimary
        )

        Spacer(modifier = Modifier.width(16.dp))

        Text(
            text = "下一周",
            fontSize = 13.sp,
            color = TextSecondary,
            modifier = Modifier.clickable(onClick = onNextWeek).padding(horizontal = 4.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = "›",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = TextSecondary,
            modifier = Modifier
                .clickable(onClick = onNextWeek)
                .padding(horizontal = 8.dp)
        )

        Spacer(modifier = Modifier.width(12.dp))

        Text(
            text = "今天",
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium,
            color = Gold,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(Gold.copy(alpha = 0.1f))
                .clickable(onClick = onGoToday)
                .padding(horizontal = 14.dp, vertical = 6.dp)
        )
    }
}

@Composable
private fun ScheduleListContent(
    groupedSchedules: Map<String, List<Schedule>>,
    refreshing: Boolean,
    pullProgress: Float,
    onPullStart: (Float) -> Unit,
    onPullEnd: () -> Unit
) {
    val entries = groupedSchedules.entries.toList()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectVerticalDragGestures(onDragStart = {}, onDragEnd = { onPullEnd() }) { _, dragAmount ->
                    if (dragAmount > 0) {
                        onPullStart(dragAmount)
                    }
                }
            },
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        entries.forEachIndexed { index, (dateLabel, schedules) ->
            item(key = "header_$dateLabel") {
                DateGroupHeader(dateLabel = dateLabel)
            }

            itemsIndexed(schedules, key = { _, schedule -> schedule.id }) { _, schedule ->
                ScheduleCard(schedule = schedule)
            }

            if (index < entries.lastIndex) {
                item {
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

@Composable
private fun DateGroupHeader(dateLabel: String) {
    Text(
        text = dateLabel,
        fontSize = 14.sp,
        fontWeight = FontWeight.Bold,
        color = TextMuted,
        modifier = Modifier.padding(vertical = 10.dp)
    )
}

@Composable
private fun ScheduleCard(schedule: Schedule) {
    val statusColor = when (schedule.status) {
        "pending" -> Gold
        "ongoing" -> Teal
        else -> Color(0xFFD1D5DB)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(CardBackground)
            .clickable(onClick = {})
            .padding(start = 0.dp, end = 14.dp, top = 14.dp, bottom = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .width(6.dp)
                .height(48.dp)
                .background(statusColor, RoundedCornerShape(topStart = 12.dp, bottomStart = 12.dp))
        )

        Spacer(modifier = Modifier.width(12.dp))

        val timeText = buildTimeRange(schedule.startTime, schedule.endTime)

        Text(
            text = timeText,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = Gold,
            modifier = Modifier.width(60.dp)
        )

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = schedule.title ?: "未命名日程",
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextPrimary,
                maxLines = 1
            )
            Spacer(modifier = Modifier.height(4.dp))
            Row {
                if (!schedule.location.isNullOrBlank()) {
                    Text(
                        text = "📍 ${schedule.location}",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
                if (!schedule.caseNumber.isNullOrBlank()) {
                    if (!schedule.location.isNullOrBlank()) {
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                    Text(
                        text = "⚖ ${schedule.caseNumber}",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.width(8.dp))

        StatusChip(status = schedule.status ?: "pending")
    }
}

@Composable
private fun StatusChip(status: String) {
    val label = ScheduleViewModel.statusMap[status] ?: status
    val chipColor = when (status) {
        "pending" -> Gold.copy(alpha = 0.15f)
        "ongoing" -> Teal.copy(alpha = 0.15f)
        "completed" -> Color(0xFF34D399).copy(alpha = 0.15f)
        "cancelled" -> Color(0xFFF472B6).copy(alpha = 0.15f)
        else -> BorderLight
    }
    val textColor = when (status) {
        "pending" -> Gold
        "ongoing" -> Teal
        "completed" -> Color(0xFF059669)
        "cancelled" -> Color(0xFFDB2777)
        else -> TextMuted
    }

    Text(
        text = label,
        fontSize = 11.sp,
        fontWeight = FontWeight.Medium,
        color = textColor,
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(chipColor)
            .padding(horizontal = 8.dp, vertical = 3.dp)
    )
}

@Composable
private fun FloatingActionButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .size(104.dp)
            .shadow(12.dp, CircleShape)
            .clip(CircleShape)
            .background(Brush.linearGradient(colors = listOf(Gold, GoldLight)))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "+",
            fontSize = 48.sp,
            fontWeight = FontWeight.Light,
            color = Color.White
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CreateScheduleBottomSheet(
    form: com.hejiao.ui.viewModel.ScheduleForm,
    submitting: Boolean,
    onFormChange: (String, String) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.4f))
            .clickable(onClick = onDismiss),
        contentAlignment = Alignment.BottomCenter
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                .background(CardBackground)
                .imePadding()
                .clickable(enabled = false) {}
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .width(40.dp)
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(BorderLight)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "新增日程",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(20.dp))

            OutlinedTextField(
                value = form.title,
                onValueChange = { onFormChange("title", it) },
                label = { Text("日程标题 *", fontSize = 14.sp) },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Gold,
                    unfocusedBorderColor = BorderLight,
                    cursorColor = Gold
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = form.startTime,
                    onValueChange = { onFormChange("startTime", it) },
                    label = { Text("开始时间", fontSize = 13.sp) },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Gold,
                        unfocusedBorderColor = BorderLight,
                        cursorColor = Gold
                    ),
                    modifier = Modifier.weight(1f)
                )

                OutlinedTextField(
                    value = form.endTime,
                    onValueChange = { onFormChange("endTime", it) },
                    label = { Text("结束时间", fontSize = 13.sp) },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Gold,
                        unfocusedBorderColor = BorderLight,
                        cursorColor = Gold
                    ),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = form.location,
                onValueChange = { onFormChange("location", it) },
                label = { Text("地点（可选）", fontSize = 14.sp) },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Gold,
                    unfocusedBorderColor = BorderLight,
                    cursorColor = Gold
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
                    .padding(horizontal = 20.dp)
                    .shadow(8.dp, RoundedCornerShape(12.dp))
                    .clip(RoundedCornerShape(12.dp))
                    .background(Brush.linearGradient(colors = listOf(Gold, GoldLight)))
                    .clickable(enabled = !submitting, onClick = onSubmit),
                contentAlignment = Alignment.Center
            ) {
                if (submitting) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(26.dp), strokeWidth = 2.5.dp)
                } else {
                    Text(
                        text = "创建日程",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

private fun buildTimeRange(startTime: String?, endTime: String?): String {
    if (startTime.isNullOrBlank()) return "--:--"
    val startPart = startTime.substringAfter(" ").substringBefore(":").let {
        if (it.length == 2) it else "0$it"
    } + ":" + startTime.substringAfter(" ").substringAfter(":").substringBefore(":").let {
        if (it.length == 2) it else "${it}0"
    }.take(2)

    if (endTime.isNullOrBlank()) return "$startPart - --:--"

    val endPart = endTime.substringAfter(" ").substringBefore(":").let {
        if (it.length == 2) it else "0$it"
    } + ":" + endTime.substringAfter(" ").substringAfter(":").substringBefore(":").let {
        if (it.length == 2) it else "${it}0"
    }.take(2)

    return "$startPart - $endPart"
}
