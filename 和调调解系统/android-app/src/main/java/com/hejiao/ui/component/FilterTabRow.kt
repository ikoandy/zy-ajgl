package com.hejiao.ui.component

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hejiao.ui.theme.BorderLight
import com.hejiao.ui.theme.Gold
import com.hejiao.ui.theme.GoldDim
import com.hejiao.ui.theme.TextMuted
import com.hejiao.ui.theme.TextSecondary

data class FilterItem(val key: String, val label: String)

@Composable
fun FilterTabRow(
    items: List<FilterItem>,
    selectedKey: String,
    onSelect: (String) -> Unit,
) {
    val scrollState = rememberScrollState()

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(scrollState)
            .padding(horizontal = 16.dp, vertical = 8.dp),
    ) {
        items.forEachIndexed { index, item ->
            val isSelected = item.key == selectedKey
            Text(
                text = item.label,
                fontSize = 13.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                color = if (isSelected) Gold else TextSecondary,
                modifier = Modifier
                    .clip(RoundedCornerShape(999.dp))
                    .background(if (isSelected) GoldDim else BorderLight)
                    .padding(horizontal = 16.dp, vertical = 8.dp),
            )
            if (index < items.lastIndex) {
                Spacer(modifier = Modifier.width(8.dp))
            }
        }
    }
}
