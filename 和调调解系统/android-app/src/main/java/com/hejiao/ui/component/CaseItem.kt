package com.hejiao.ui.component

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hejiao.data.api.model.Case
import com.hejiao.ui.theme.BorderLight
import com.hejiao.ui.theme.Gold
import com.hejiao.ui.theme.TextMuted
import com.hejiao.ui.theme.TextPrimary

@Composable
fun CaseItem(caseItem: Case, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = caseItem.caseNumber ?: "--",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Gold,
            )
            StatusTag(status = caseItem.status ?: "pending")
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = caseItem.title ?: "",
            fontSize = 15.sp,
            fontWeight = FontWeight.Medium,
            color = TextPrimary,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (!caseItem.typeName.isNullOrBlank()) {
                Text(
                    text = caseItem.typeName,
                    fontSize = 12.sp,
                    color = TextMuted,
                )
                Spacer(modifier = Modifier.width(12.dp))
            }
            Text(
                text = caseItem.createdAt ?: "",
                fontSize = 12.sp,
                color = TextMuted,
            )
        }
        Spacer(modifier = Modifier.height(12.dp))
        HorizontalDivider(color = BorderLight)
    }
}
