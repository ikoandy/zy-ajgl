package com.hejiao.ui.screen.feedback

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hejiao.data.api.model.Case
import com.hejiao.data.api.model.CaseParty
import com.hejiao.ui.component.EmptyState
import com.hejiao.ui.component.FullScreenLoading
import com.hejiao.ui.theme.Background
import com.hejiao.ui.theme.BorderLight
import com.hejiao.ui.theme.CardBackground
import com.hejiao.ui.theme.Dark
import com.hejiao.ui.theme.DarkSecondary
import com.hejiao.ui.theme.Gold
import com.hejiao.ui.theme.GoldDim
import com.hejiao.ui.theme.TextMuted
import com.hejiao.ui.theme.TextPrimary
import com.hejiao.ui.theme.TextSecondary
import com.hejiao.ui.viewModel.FeedbackViewModel
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedbackScreen(
    cases: List<Case>,
    viewModel: FeedbackViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit = {}
) {
    val uiState by remember { viewModel.uiState }
    var showCasePicker by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Brush.verticalGradient(colors = listOf(Dark, DarkSecondary)))
                    .padding(horizontal = 8.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                androidx.compose.material3.IconButton(onClick = onNavigateBack) {
                    androidx.compose.material3.Icon(
                        imageVector = androidx.compose.material.icons.Icons.Default.ArrowBack,
                        contentDescription = "返回",
                        tint = Color.White
                    )
                }
                Text(
                    text = "调解评价",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(start = 4.dp)
                )
            }
        }
    ) { paddingValues ->
        if (uiState.submitSuccess) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(Background),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "✅", fontSize = 64.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "评价提交成功！",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "感谢您的反馈",
                        fontSize = 14.sp,
                        color = TextSecondary
                    )
                    Spacer(modifier = Modifier.height(32.dp))
                    Text(
                        text = "继续评价",
                        fontSize = 15.sp,
                        color = Gold,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { viewModel.resetForm() }
                            .padding(horizontal = 24.dp, vertical = 12.dp)
                    )
                }
            }
        } else if (uiState.selectedCase == null || uiState.selectedPartyId == null) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(Background)
                    .verticalScroll(rememberScrollState())
            ) {
                Spacer(modifier = Modifier.height(16.dp))

                SectionTitle(title = "选择案件")

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(CardBackground)
                        .clickable { showCasePicker = true }
                        .padding(vertical = 28.dp, horizontal = 20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    if (uiState.selectedCase == null) {
                        Text(
                            text = "点击选择要评价的案件",
                            color = TextMuted,
                            fontSize = 14.sp
                        )
                    } else {
                        Text(
                            text = "${uiState.selectedCase!!.caseNumber} - ${uiState.selectedCase!!.title}",
                            color = TextPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                if (uiState.selectedCase != null && uiState.parties.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(24.dp))

                    SectionTitle(title = "选择当事人")

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        uiState.parties.forEach { party ->
                            val isSelected = uiState.selectedPartyId == party.id
                            val backgroundColor by animateColorAsState(
                                targetValue = if (isSelected) GoldDim else Color(0xFFF5F5F5),
                                label = "partyBg"
                            )
                            val textColor by animateColorAsState(
                                targetValue = if (isSelected) Gold else TextMuted,
                                label = "partyText"
                            )
                            val borderColor by animateColorAsState(
                                targetValue = if (isSelected) Gold.copy(alpha = 0.4f) else Color(0xFFE0E0E0),
                                label = "partyBorder"
                            )

                            Text(
                                text = party.name ?: "--",
                                color = textColor,
                                fontSize = 14.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                textAlign = TextAlign.Center,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(30.dp))
                                    .background(backgroundColor)
                                    .border(BorderStroke(1.dp, borderColor), RoundedCornerShape(30.dp))
                                    .clickable { viewModel.selectParty(party.id, party.name ?: "") }
                                    .padding(vertical = 14.dp, horizontal = 28.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(40.dp))

                EmptyState("请先选择案件和当事人进行评价", icon = "📝")
            }
        } else {
            FeedbackFormContent(
                uiState = uiState,
                viewModel = viewModel,
                onShowCasePicker = { showCasePicker = true },
                paddingValues = paddingValues
            )
        }
    }

    if (showCasePicker) {
        CasePickerDialog(
            cases = cases,
            selectedId = uiState.selectedCase?.id,
            onSelect = { case ->
                showCasePicker = false
                viewModel.selectCase(case)
            },
            onDismiss = { showCasePicker = false }
        )
    }
}

@Composable
private fun SectionTitle(title: String) {
    Text(
        text = title,
        fontSize = 17.sp,
        fontWeight = FontWeight.Bold,
        color = TextPrimary,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FeedbackFormContent(
    uiState: FeedbackViewModel.FeedbackUiState,
    viewModel: FeedbackViewModel,
    onShowCasePicker: () -> Unit,
    paddingValues: androidx.compose.foundation.layout.PaddingValues
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .background(Background)
            .verticalScroll(rememberScrollState())
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // 步骤1 - 选择案件
        SectionTitle(title = "选择案件")

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(CardBackground)
                .clickable(onClick = onShowCasePicker)
                .padding(vertical = 22.dp, horizontal = 20.dp),
            contentAlignment = Alignment.Center
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${uiState.selectedCase!!.caseNumber} - ${uiState.selectedCase!!.title}",
                    color = TextPrimary,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "更换",
                    color = Gold,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(start = 4.dp)
                )
            }
        }

        // 步骤2 - 选择当事人
        if (uiState.parties.isNotEmpty()) {
            Spacer(modifier = Modifier.height(20.dp))
            SectionTitle(title = "选择当事人")

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                uiState.parties.forEach { party ->
                    val isSelected = uiState.selectedPartyId == party.id
                    val backgroundColor by animateColorAsState(
                        targetValue = if (isSelected) GoldDim else Color(0xFFF5F5F5),
                        label = "partyBg2"
                    )
                    val textColor by animateColorAsState(
                        targetValue = if (isSelected) Gold else TextMuted,
                        label = "partyText2"
                    )
                    val borderColor by animateColorAsState(
                        targetValue = if (isSelected) Gold.copy(alpha = 0.4f) else Color(0xFFE0E0E0),
                        label = "partyBorder2"
                    )

                    Text(
                        text = party.name ?: "--",
                        color = textColor,
                        fontSize = 14.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .clip(RoundedCornerShape(30.dp))
                            .background(backgroundColor)
                            .border(BorderStroke(1.dp, borderColor), RoundedCornerShape(30.dp))
                            .clickable { viewModel.selectParty(party.id, party.name ?: "") }
                            .padding(vertical = 14.dp, horizontal = 28.dp)
                    )
                }
            }
        }

        // 步骤3 - 评分区
        Spacer(modifier = Modifier.height(24.dp))
        RatingSection(uiState = uiState, viewModel = viewModel)

        // 评语输入区
        CommentSection(uiState = uiState, viewModel = viewModel)

        // 匿名选项
        AnonymousSection(uiState = uiState, viewModel = viewModel)

        // 提交按钮
        SubmitButton(uiState = uiState, viewModel = viewModel)

        Spacer(modifier = Modifier.height(48.dp))
    }
}

// ==================== 总体满意度评分 ====================

@Composable
private fun RatingSection(
    uiState: FeedbackViewModel.FeedbackUiState,
    viewModel: FeedbackViewModel
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(CardBackground)
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // 总体满意度标题
        Text(
            text = "总体满意度",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )

        Spacer(modifier = Modifier.height(16.dp))

        // 大星星评分
        StarRatingRow(
            rating = uiState.rating,
            starSize = 48.sp,
            onRatingChange = { viewModel.setRating(it) }
        )

        Spacer(modifier = Modifier.height(10.dp))

        // 评分文字
        Text(
            text = if (uiState.rating > 0) viewModel.ratingTexts[uiState.rating] ?: "" else "",
            fontSize = 13.sp,
            color = TextMuted
        )

        Spacer(modifier = Modifier.height(24.dp))

        // 分项评分
        SubRatingItem(
            label = "服务态度",
            rating = uiState.attitude,
            field = "attitude",
            viewModel = viewModel,
            isLast = false
        )

        SubRatingItem(
            label = "处理效率",
            rating = uiState.efficiency,
            field = "efficiency",
            viewModel = viewModel,
            isLast = false
        )

        SubRatingItem(
            label = "公平公正",
            rating = uiState.fairness,
            field = "fairness",
            viewModel = viewModel,
            isLast = true
        )
    }
}

@Composable
private fun StarRatingRow(
    rating: Int,
    starSize: androidx.compose.ui.unit.TextUnit,
    onRatingChange: (Int) -> Unit
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        repeat(5) { index ->
            val starIndex = index + 1
            val isSelected = starIndex <= rating
            Text(
                text = "★",
                fontSize = starSize,
                color = if (isSelected) Color(0xFFF59E0B) else Color(0xFFE5E7EB),
                modifier = Modifier.clickable { onRatingChange(starIndex) }
            )
        }
    }
}

@Composable
private fun SubRatingItem(
    label: String,
    rating: Int,
    field: String,
    viewModel: FeedbackViewModel,
    isLast: Boolean
) {
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = label,
                fontSize = 15.sp,
                color = TextPrimary
            )
            StarRatingRow(
                rating = rating,
                starSize = 36.sp,
                onRatingChange = { viewModel.setSubRating(field, it) }
            )
        }

        if (!isLast) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(BorderLight)
            )
        }
    }
}

// ==================== 评语输入 ====================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CommentSection(
    uiState: FeedbackViewModel.FeedbackUiState,
    viewModel: FeedbackViewModel
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(top = 20.dp)
    ) {
        SectionTitle(title = "意见建议")
        OutlinedTextField(
            value = uiState.comment,
            onValueChange = { viewModel.onCommentChange(it) },
            placeholder = {
                Text(
                    text = "请输入您的意见和建议（选填）...",
                    color = TextMuted,
                    fontSize = 14.sp
                )
            },
            modifier = Modifier
                .fillMaxWidth()
                .defaultMinSize(minHeight = 160.dp),
            shape = RoundedCornerShape(8.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Gold,
                unfocusedBorderColor = BorderLight,
                cursorColor = TextPrimary,
                focusedContainerColor = Color(0xFFFAFAFA),
                unfocusedContainerColor = Color(0xFFFAFAFA)
            ),
            maxLines = 6
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 6.dp),
            horizontalArrangement = Arrangement.End
        ) {
            Text(
                text = "${uiState.comment.length}/500",
                fontSize = 11.sp,
                color = TextMuted
            )
        }
    }
}

// ==================== 匿名选项 ====================

@Composable
private fun AnonymousSection(
    uiState: FeedbackViewModel.FeedbackUiState,
    viewModel: FeedbackViewModel
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(top = 20.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = "匿名提交",
            fontSize = 15.sp,
            color = TextPrimary
        )
        Switch(
            checked = uiState.isAnonymous,
            onCheckedChange = { viewModel.toggleAnonymous() },
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = Gold,
                uncheckedThumbColor = Color.White,
                uncheckedTrackColor = Color(0xFFD1D5DB)
            )
        )
    }
}

// ==================== 提交按钮 ====================

@Composable
private fun SubmitButton(
    uiState: FeedbackViewModel.FeedbackUiState,
    viewModel: FeedbackViewModel
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(top = 24.dp)
            .height(80.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Brush.horizontalGradient(colors = listOf(Gold, GoldLight)))
            .clickable(enabled = !uiState.submitting) { viewModel.submit() },
        contentAlignment = Alignment.Center
    ) {
        if (uiState.submitting) {
            androidx.compose.material3.CircularProgressIndicator(
                color = Color.White,
                modifier = androidx.compose.foundation.layout.size(28.dp)
            )
        } else {
            Text(
                text = "提交评价",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                letterSpacing = 4.sp
            )
        }
    }
}

// ==================== 案件选择弹窗 ====================

@Composable
private fun CasePickerDialog(
    cases: List<Case>,
    selectedId: Int?,
    onSelect: (Case) -> Unit,
    onDismiss: () -> Unit
) {
    androidx.compose.material3.AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = CardBackground,
        shape = RoundedCornerShape(16.dp),
        title = {
            Text(
                text = "选择案件",
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp,
                color = TextPrimary
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                if (cases.isEmpty()) {
                    Text(
                        text = "暂无可用案件",
                        color = TextMuted,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(vertical = 24.dp)
                    )
                } else {
                    cases.forEach { case ->
                        val isSelected = case.id == selectedId
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) GoldDim else Color.Transparent)
                                .clickable { onSelect(case) }
                                .padding(vertical = 14.dp, horizontal = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (isSelected) {
                                Text(
                                    text = "✓",
                                    color = Gold,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    modifier = Modifier.padding(end = 8.dp)
                                )
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = case.caseNumber ?: "--",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = TextPrimary
                                )
                                Text(
                                    text = case.title ?: "",
                                    fontSize = 13.sp,
                                    color = TextSecondary,
                                    maxLines = 1
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            androidx.compose.material3.TextButton(onClick = onDismiss) {
                Text("取消", color = TextSecondary)
            }
        }
    )
}
