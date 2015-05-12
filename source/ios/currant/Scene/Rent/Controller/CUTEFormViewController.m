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


@implementation FXFormController (CUTE)

- (void)updateSections {
    //just trigger setForm
    self.form = self.form;
}

@end


@implementation CUTEFormViewController

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
        headerLabel.frame = CGRectMake(16, 30, 200, 14);
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


@end
