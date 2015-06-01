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
    [self updateCustomViewConstraints];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    _mapView = [[CUTEMapView alloc] initWithFrame:self.view.bounds];
    _mapView.delegate = self;

    SMCalloutView *calloutView = [[SMCalloutView alloc] init];
    calloutView.delegate = self;
    _mapView.calloutView = calloutView;
    [self.view addSubview:_mapView];
}

- (void)updateCustomViewConstraints {

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


- (void)loadMapDataWithParams:(NSDictionary *)params {

}

- (void)showCalloutViewWithObject:(id)object inView:(UIView *)view {

}

- (void)onMapDidSelectAnnotationView:(MKAnnotationView *)view {

}

- (void)calloutViewClicked:(SMCalloutView *)calloutView {

}


@end
