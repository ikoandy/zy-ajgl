package com.hejiao.data.api

import com.hejiao.data.api.dto.CreateCaseRequest
import com.hejiao.data.api.dto.CreateScheduleRequest
import com.hejiao.data.api.dto.FeedbackRequest
import com.hejiao.data.api.dto.LoginRequest
import com.hejiao.data.api.dto.TransitionRequest
import com.hejiao.data.api.model.*
import retrofit2.http.*

interface ApiService {

    // ==================== 认证接口 ====================

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<LoginData>

    @GET("auth/me")
    suspend fun getCurrentUser(): ApiResponse<User>

    @POST("auth/logout")
    suspend fun logout(): ApiResponse<Unit>

    @PUT("auth/password")
    suspend fun changePassword(@Body request: Map<String, String>): ApiResponse<Unit>

    // ==================== 案件接口 ====================

    @GET("cases")
    suspend fun getCases(
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 20,
        @Query("status") status: String? = null,
        @Query("keyword") keyword: String? = null,
        @Query("type_id") typeId: Int? = null
    ): ApiResponse<CaseListResponse>

    @GET("cases/stats")
    suspend fun getCaseStats(): ApiResponse<DashboardStats>

    @GET("cases/types")
    suspend fun getCaseTypes(): ApiResponse<List<CaseType>>

    @GET("cases/{id}")
    suspend fun getCaseDetail(@Path("id") id: Int): ApiResponse<Case>

    @POST("cases")
    suspend fun createCase(@Body request: CreateCaseRequest): ApiResponse<Case>

    @PUT("cases/{id}")
    suspend fun updateCase(@Path("id") id: Int, @Body request: CreateCaseRequest): ApiResponse<Case>

    @GET("cases/{id}/parties")
    suspend fun getCaseParties(@Path("id") id: Int): ApiResponse<List<CaseParty>>

    // ==================== 工作流接口 ====================

    @GET("workflow/{id}/timeline")
    suspend fun getWorkflowTimeline(@Path("id") caseId: Int): ApiResponse<List<WorkflowLog>>

    @POST("workflow/{id}/transition")
    suspend fun transitionStatus(@Path("id") caseId: Int, @Body request: TransitionRequest): ApiResponse<Unit>

    // ==================== 日程接口 ====================

    @GET("schedules")
    suspend fun getSchedules(
        @Query("case_id") caseId: Int? = null,
        @Query("status") status: String? = null
    ): ApiResponse<List<Schedule>>

    @GET("schedules/today")
    suspend fun getTodaySchedules(): ApiResponse<List<Schedule>>

    @GET("schedules/calendar")
    suspend fun getCalendarSchedules(
        @Query("start_date") startDate: String,
        @Query("end_date") endDate: String
    ): ApiResponse<List<Schedule>>

    @POST("schedules")
    suspend fun createSchedule(@Body request: CreateScheduleRequest): ApiResponse<Schedule>

    // ==================== 视频会议接口 ====================

    @GET("video/sessions")
    suspend fun getVideoSessions(
        @Query("case_id") caseId: Int? = null,
        @Query("status") status: String? = null
    ): ApiResponse<List<VideoSession>>

    @POST("video/sessions")
    suspend fun createVideoSession(@Body request: Map<String, Any?>): ApiResponse<VideoSession>

    // ==================== 反馈接口 ====================

    @POST("feedbacks")
    suspend fun submitFeedback(@Body request: FeedbackRequest): ApiResponse<Unit>

    // ==================== 通知接口 ====================

    @GET("push/unread-count")
    suspend fun getUnreadCount(): ApiResponse<Int>
}
