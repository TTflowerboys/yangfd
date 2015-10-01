//
//  CUTEListViewController.m
//  currant
//
//  Created by Foster Yin on 6/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEListViewController.h"
#import <MapKit/MapKit.h>
#import <NSObject+Attachment.h>
#import <BBTJSON.h>
#import <MKMapView+BBT.h>
#import <AddressBook/AddressBook.h>
#import "CUTEMapView.h"
#import <SMCalloutView.h>
#import "CUTEConfiguration.h"
#import "NSURL+CUTE.h"
#import "CUTECommonMacro.h"
#import "CUTETracker.h"
#import "MasonryMake.h"
#import "CUTENotificationKey.h"
#import "CUTEAPIManager.h"
#import "CUTEProperty.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "NSObject+Attachment.h"
#import "NSArray+ObjectiveSugar.h"
#import "CUTEHouseType.h"
#import "UIAlertView+Blocks.h"

@implementation CUTEListViewController



- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    [self updateCustomViewConstraints];
}

- (void)updateCustomViewConstraints {
    if ([self.view isDescendantOfView:self.navigationController.view]) {
        UpdateBegin(self.view)
        MakeTopEqualTo(self.navigationController.view.top).offset(TouchHeightDefault + StatusBarHeight);
        MakeLeftEqualTo(self.navigationController.view.left);
        MakeRighEqualTo(self.navigationController.view.right);
        MakeBottomEqualTo(self.navigationController.view.bottom).offset(- TabBarHeight);
        UpdateEnd
    }

    if ([self.webView isDescendantOfView:self.view]) {
        UpdateBegin(self.webView)
        MakeEdgesEqualTo(self.view);
        UpdateEnd
    }

    UpdateBegin(_mapButton)
    MakeRighEqualTo(self.view.right).offset(-12);
    MakeBottomEqualTo(self.view.bottom).offset(-40);
    UpdateEnd

}

- (void)onMapButtonPressed:(id)sender {

}



- (void)updateMapButtonWithURL:(NSURL *)url {
    if ([url.path hasPrefix:self.URL.path]) {

        if (!_mapButton) {
            _mapButton = [UIButton buttonWithType:UIButtonTypeCustom];
            [_mapButton setImage:IMAGE(@"button-selector-map") forState:UIControlStateNormal];
            _mapButton.attachment = @"ShowMap";
            [_mapButton addTarget:self action:@selector(onMapButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
            [self.view addSubview:_mapButton];
            MakeBegin(_mapButton)
            MakeRighEqualTo(self.view.right).offset(-12);
            MakeBottomEqualTo(self.view.bottom).offset(-40);
            MakeEnd
        }

        [self.view bringSubviewToFront:_mapButton];
        [_mapButton setHidden:NO];
    }
    else {
        [_mapButton setHidden:YES];
    }
}



- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    [self updateMapButtonWithURL:webView.request.URL];
    return [super webView:webView shouldStartLoadWithRequest:request navigationType:navigationType];
}

- (void)webViewDidFinishLoad:(UIWebView *)webView {
    [super webViewDidFinishLoad:webView];
    [self updateMapButtonWithURL:webView.request.URL];
}


@end
