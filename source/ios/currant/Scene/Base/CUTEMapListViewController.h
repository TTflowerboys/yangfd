//
//  CUTEMapListViewController.h
//  currant
//
//  Created by Foster Yin on 6/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEWebViewController.h"
#import <MapKit/MapKit.h>
#import <SMCalloutView.h>
#import "CUTEMapView.h"

@interface CUTEMapListViewController : CUTEWebViewController <MKMapViewDelegate, SMCalloutViewDelegate>

@property (nonatomic, readonly) CUTEMapView *mapView;

@property (nonatomic, readonly) UIButton *mapButton;

@end

@interface CUTEMapListViewController (Subclass)

- (void)loadMapData;

- (void)showCalloutViewWithObject:(id)object inView:(UIView *)view;

- (void)onMapDidSelectAnnotationView:(MKAnnotationView *)view;

- (void)calloutViewClicked:(SMCalloutView *)calloutView;

@end

