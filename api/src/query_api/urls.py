from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.UploadTableView.as_view()),
    path('run-query/', views.RunQueryView.as_view()),
    path('query-status/', views.QueryStatusView.as_view()),
    path('client-id/', views.ClientIdView.as_view()),
    path('authentication-token/', views.AuthenticationTokenView.as_view()),
    path('save/', views.SaveToCDriveView.as_view()),
]
