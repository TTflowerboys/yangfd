//
//  CUTEFormViewController.m
//  currant
//
//  Created by Foster Yin on 5/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormViewController.h"
#import "CUTEForm.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEFormDefaultCell.h"
#import "CUTECommonMacro.h"
#import "MasonryMake.h"
#import "CUTETracker.h"
#import <NSString+SLRESTfulCoreData.h>
#import "CUTELocalizationSwitcher.h"



@implementation FXFormController (CUTE)

//- (id)formSectionAtIndex:(NSUInteger)index {
//    SEL selector = NSSelectorFromString(@"sectionAtIndex:");
//    if ([self respondsToSelector:selector]) {
//        return [self performSelector:selector withObject:[NSNumber numberWithUnsignedInteger:index]];
//    }
//    return nil;
//}

- (void)updateSections {
    //just trigger setForm
    self.form = self.form;
}

- (FXFormField *)fieldForKey:(NSString *)key {
    __block FXFormField *retField = nil;
    [self enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
        if ([field.key isEqualToString:key]) {
            retField = field;
        }
    }];
    return retField;
}

@end



@implementation CUTEFormViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.tableView.accessibilityIdentifier = @"Form";

    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveLocalizationDidUpdate:) name:CUTELocalizationDidUpdateNotification object:nil];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];

    TrackScreen(GetScreenName(self));
}

- (void)setTableView:(UITableView *)tableView
{
    [super setTableView:tableView];
    [self.formController registerDefaultFieldCellClass:[CUTEFormDefaultCell class]];
    [self.formController registerCellClass:[CUTEFormDefaultCell class] forFieldType:FXFormFieldTypeOption];
    [self.formController registerDefaultViewControllerClass:[CUTEFormViewController class]];
}

- (BOOL)validateFormWithScenario:(NSString *)scenario {

    CUTEForm *form = (CUTEForm *)self.formController.form;
    NSError *error = [form validateFormWithScenario:scenario];
    if (error) {
        [SVProgressHUD showErrorWithError:error];
        return NO;
    }
    return YES;
}

- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)index
{
    NSString *header = [[[self.formController sectionAtIndex:index] valueForKey:@"header"] description];

    if (!IsNilNullOrEmpty(header)) {
        UILabel *headerLabel = [[UILabel alloc] init];
        headerLabel.text = header;
        headerLabel.textColor = HEXCOLOR(0x666666, 1.0);
        headerLabel.font = [UIFont systemFontOfSize:14];
        headerLabel.frame = CGRectMake(16, 30, 300, 14);
        UIView *view = [[UIView alloc] init];
        [view addSubview:headerLabel];
        return view;
    }
    return nil;
}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)index
{
    NSString *header = [[[self.formController sectionAtIndex:index] valueForKey:@"header"] description];
    return IsNilNullOrEmpty(header)? 0: 51;
}

- (void)onReceiveLocalizationDidUpdate:(NSNotification *)notif {

}


@end
