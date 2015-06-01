//
//  CUTEMapListViewController.m
//  currant
//
//  Created by Foster Yin on 6/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEMapListViewController.h"
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

@implementation CUTEMapListViewController



- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];

    //TODO check process of view
    //back from other controller, need update the constraints
    [self updateCustomViewConstraints];
}

- (void)updateCustomViewConstraints {

    if ([_mapButton.attachment isEqualToString:@"ShowList"]) {

        if ([self.view isDescendantOfView:self.navigationController.view]) {
            UpdateBegin(self.view)
            MakeEdgesEqualTo(self.navigationController.view);
            UpdateEnd
        }

        if ([_mapView isDescendantOfView:self.view]) {
            UpdateBegin(_mapView)
            MakeEdgesEqualTo(self.view);
            UpdateEnd
        }


        UpdateBegin(_mapButton)
        MakeRighEqualTo(self.view.right).offset(-12);
        MakeBottomEqualTo(self.view.bottom).offset(-40 - TabBarHeight);
        UpdateEnd

    }
    else {

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
}

- (void)flipMapViewAnimated:(BOOL)animated completion:(void (^)(BOOL finished))completion  {
    CGFloat duration = animated? 0.3: 0;
    if ([_mapButton.attachment isEqualToString:@"ShowMap"]) {
        if (!_mapView) {
            _mapView = [[CUTEMapView alloc] initWithFrame:self.view.bounds];
            _mapView.delegate = self;

            SMCalloutView *calloutView = [[SMCalloutView alloc] init];
            calloutView.delegate = self;
            _mapView.calloutView = calloutView;
        }
        [[self navigationController] setNavigationBarHidden:YES animated:YES];
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_HIDE_ROOT_TAB_BAR object:nil];

        [UIView transitionWithView:self.view
                          duration:duration
                           options:UIViewAnimationOptionTransitionFlipFromRight
                        animations:^{
                            [self.webView removeFromSuperview];
                            [self.view addSubview:_mapView];
                        }
                        completion:^(BOOL finished) {

                            [self clearBackButton];
                            [_mapButton setImage:IMAGE(@"button-selector-list") forState:UIControlStateNormal];
                            _mapButton.attachment = @"ShowList";
                            [self updateCustomViewConstraints];
                            [self loadMapData];
                            if (completion) {
                                completion(finished);
                            }

                        }];

    }
    else {
        [[self navigationController] setNavigationBarHidden:NO animated:YES];
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_SHOW_ROOT_TAB_BAR object:nil];

        [UIView transitionWithView:self.view
                          duration:duration
                           options:UIViewAnimationOptionTransitionFlipFromLeft
                        animations:^{
                            [_mapView removeFromSuperview];
                            [self.view addSubview:self.webView];
                        }
                        completion:^(BOOL finished) {
                            [self updateBackButton];
                            [_mapButton setImage:IMAGE(@"button-selector-map") forState:UIControlStateNormal];
                            _mapButton.attachment = @"ShowMap";
                            [self updateCustomViewConstraints];
                            if (completion) {
                                completion(finished);
                            }
                        }];
    }

    [self.view bringSubviewToFront:_mapButton];
}

- (void)onMapButtonPressed:(id)sender {
    [self flipMapViewAnimated:YES completion:nil];
}



- (void)updateMapButtonWithURL:(NSURL *)url {
    if ([url.path hasPrefix:self.url.path]) {

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

- (MKAnnotationView *)mapView:(MKMapView *)mapView viewForAnnotation:(id <MKAnnotation>)annotation
{
    MKAnnotationView *view = [mapView dequeueReusableAnnotationViewWithIdentifier:@"annotation"];
    if (!view) {
        view = [[MKAnnotationView alloc] initWithAnnotation:annotation reuseIdentifier:@"annotation"];
        //view.canShowCallout = YES;
    }
    view.annotation = annotation;
    view.image = IMAGE(@"icon-location-building");
    return view;
}


- (void)mapView:(MKMapView *)mapView didSelectAnnotationView:(MKAnnotationView *)view {
    [self onMapDidSelectAnnotationView:view];
}


- (void)loadMapData {

}

- (void)showCalloutViewWithObject:(id)object inView:(UIView *)view {

}

- (void)onMapDidSelectAnnotationView:(MKAnnotationView *)view {

}

- (void)calloutViewClicked:(SMCalloutView *)calloutView {

}


@end
