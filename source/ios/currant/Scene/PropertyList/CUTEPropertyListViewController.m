//
//  CUTEPropertyListViewController.m
//  currant
//
//  Created by Foster Yin on 3/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyListViewController.h"
#import <MapKit/MapKit.h>
#import <NSObject+Attachment.h>
#import <BBTJSON.h>
#import <MKMapView+BBT.h>
#import <AddressBook/AddressBook.h>


@interface CUTEPropertyListViewController ()
{
    MKMapView *_mapView;

    BOOL _mapShowing;

    UIButton *_mapButton;
}

@end


@implementation CUTEPropertyListViewController

- (void)loadURLPath:(NSString *)urlPath {
    [super loadURLPath:urlPath];

    if (!_mapButton) {
        _mapButton = [UIButton buttonWithType:UIButtonTypeCustom];
        [_mapButton setImage:IMAGE(@"button-selector-map") forState:UIControlStateNormal];
        _mapButton.frame = CGRectMake(ScreenWidth - 50, ScreenHeight - 50 - 50, 40, 40);
        _mapButton.attachment = @"ShowMap";
        [_mapButton addTarget:self action:@selector(onMapButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
        [self.view addSubview:_mapButton];
    }
    [self.view bringSubviewToFront:_mapButton];
}

- (void)onMapButtonPressed:(id)sender {
    if ([_mapButton.attachment isEqualToString:@"ShowMap"]) {
        if (!_mapView) {
            _mapView = [[MKMapView alloc] initWithFrame:self.view.bounds];
        }
        [UIView transitionFromView:self.webView toView:_mapView duration:0.2 options:UIViewAnimationOptionTransitionFlipFromRight
                        completion:^(BOOL finished) {
                            self.webView.hidden = YES;
                            _mapView.hidden = NO;
                            [self clearBackButton];

                            [_mapButton setImage:IMAGE(@"button-selector-list") forState:UIControlStateNormal];
                            _mapButton.attachment = @"ShowList";
                            [self loadMapData];
                        }];
    }
    else {
        [UIView transitionFromView:_mapView toView:self.webView duration:0.2 options:UIViewAnimationOptionTransitionFlipFromLeft
                        completion:^(BOOL finished) {
                            self.webView.hidden = NO;
                            _mapView.hidden = YES;
                            [self updateBackButton];
                            [_mapButton setImage:IMAGE(@"button-selector-map") forState:UIControlStateNormal];
                            _mapButton.attachment = @"ShowMap";
        }];
    }

    [self.view bringSubviewToFront:_mapButton];
}

- (void)loadMapData {
    if (!IsArrayNilOrEmpty(_mapView.annotations)) {
        [_mapView removeAnnotations:_mapView.annotations];
    }

    NSString *rawPropertyList = [self.webView stringByEvaluatingJavaScriptFromString:@"JSON.stringify(propertyList)"];
    NSArray *propertyList = [rawPropertyList JSONObject];

    NSMutableArray *locations = [NSMutableArray arrayWithCapacity:propertyList.count];
    NSMutableArray *annotations = [NSMutableArray arrayWithCapacity:propertyList.count];
    _.arrayEach(propertyList, ^(NSDictionary *property) {
            CLLocation *location = [[CLLocation alloc] initWithLatitude:[property[@"latitude"] doubleValue] longitude:[property[@"longitude"] doubleValue]];
            [locations addObject:location];
        MKPlacemark *placemark = [[MKPlacemark alloc] initWithCoordinate:CLLocationCoordinate2DMake([property[@"latitude"] doubleValue], [property[@"longitude"] doubleValue]) addressDictionary:@{                                                                                                        (NSString *) kABPersonAddressStreetKey : property[@"name"]}];

            [annotations addObject:placemark];
    });
    [_mapView addAnnotations:annotations];
    [_mapView zoomToFitMapLocationsInsideArray:locations];
}

- (void)updateMapButtonWithURL:(NSURL *)url {
    if ([_mapButton.attachment isEqualToString:@"ShowMap"] && [url.path hasPrefix:self.urlPath]) {
        [_mapButton setHidden:NO];
    }
    else {
        [_mapButton setHidden:YES];
    }
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    [self updateMapButtonWithURL:request.URL];
    return [super webView:webView shouldStartLoadWithRequest:request navigationType:navigationType];
}

@end
