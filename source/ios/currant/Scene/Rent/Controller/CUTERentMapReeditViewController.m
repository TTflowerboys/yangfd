//
//  CUTERentMapReeditViewController.m
//  currant
//
//  Created by Foster Yin on 12/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "CUTERentMapReeditViewController.h"
#import <BFTask.h>
#import <BFCancellationTokenSource.h>
#import "CUTECommonMacro.h"
#import "CUTETracker.h"


@interface CUTERentMapReeditViewController () {

    BOOL _mapShowCurrentRegion;
}

@end

@implementation CUTERentMapReeditViewController


- (instancetype)init
{
    self = [super init];
    if (self) {

    }
    return self;
}

#pragma -mark Lifecycle

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"RentAddressMap/房产位置");


    [self.textField.rightView addGestureRecognizer:[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onAddressLocationButtonTapped:)]];
    [self.userLocationButton addTarget:self action:@selector(onUserLocationButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:YES];

    TrackScreen(GetScreenName(self));
    //update address after edit user's address
    CUTEProperty *property = self.form.ticket.property;
    self.textField.text = property.address;
    [self.textField setNeedsDisplay];

    if (!self.form.ticket.property.latitude || !self.form.ticket.property.longitude) {
        [self onAddressLocationButtonTapped:nil];
    }
    else {
        if (!IsNilOrNull(self.form.ticket.property.latitude) && !IsNilOrNull(self.form.ticket.property.longitude)) {
            CLLocation *location = [[CLLocation alloc] initWithLatitude:self.form.ticket.property.latitude.doubleValue longitude:self.form.ticket.property.longitude.doubleValue];
            if (location) {
                MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, kRegionDistance, kRegionDistance);
                [self.mapView setRegion:[self.mapView regionThatFits:region] animated:YES];
            }
        }
    }
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];

    if (self.cancellationTokenSource != nil) {
        if (!self.cancellationTokenSource.isCancellationRequested) {
            [self.cancellationTokenSource cancel];
        }
    }
}

#pragma -mark Action

- (void)onAddressLocationButtonTapped:(id)sender {
    [self startUpdateLocationWithAddress];
}

- (void)onUserLocationButtonPressed:(id)sender {
    [self startUpdateAllWithCurrentLocation];
}

- (void)onAddressBeginEditing:(id)sender {
    //do nothing
}


#pragma -mark MkMapViewDelegate
- (void)mapView:(MKMapView *)mapView regionDidChangeAnimated:(__unused BOOL)animated
{
    if (_mapShowCurrentRegion) {
        CLLocation *location = [[CLLocation alloc] initWithLatitude:mapView.centerCoordinate.latitude
                                                          longitude:mapView.centerCoordinate.longitude];
        [self startUpdateAddressWithLocation:location];
    }
    else {
        _mapShowCurrentRegion = YES;
    }
}

#pragma -mark UITextFieldDelegate

- (BOOL)textFieldShouldBeginEditing:(UITextField *)textField {

    return NO;
}

@end
